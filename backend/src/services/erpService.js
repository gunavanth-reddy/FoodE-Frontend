
const BASE_URL = "https://student.srmap.edu.in/srmapstudentcorner";
const CAPTCHA_URL = "https://srmapi.mrpan.in/api/captcha/solve";
const UNREACHABLE = "SRM server is unreachable. Please try again later.";

const mainHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.5",
  "Upgrade-Insecure-Requests": "1",
  "Cache-Control": "max-age=0",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Sec-GPC": "1",
  "sec-ch-ua": '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
};

function textFromHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:div|p|li|h[1-6])\s*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/\s+/g, " ")
    .trim();
}

function tableRows(html) {
  return [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)].map((row) =>
    [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]\s*>/gi)].map(
      (cell) => textFromHtml(cell[1])
    )
  );
}

function getCookies(response) {
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie") || ""];

  return setCookies
    .flatMap((cookie) => cookie.split(/,(?=\s*[^;,]+=)/))
    .map((cookie) => cookie.split(";")[0].trim())
    .filter(Boolean);
}

async function fetchOrThrow(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(UNREACHABLE);
  }
  if (!response.ok) {
    throw new Error(
      `${UNREACHABLE} (HTTP ${response.status} from ${new URL(url).host})`
    );
  }
  return response;
}

async function solveCaptcha(imageBuffer) {
  const form = new FormData();
  form.append("file", new Blob([imageBuffer]), "captcha.png");

  const response = await fetchOrThrow(CAPTCHA_URL, {
    method: "POST",
    body: form,
  });
  const result = (await response.text()).trim();
  if (!result) throw new Error("Captcha service returned an empty response.");

  try {
    const parsed = JSON.parse(result);
    if (typeof parsed === "string" && parsed.trim()) return parsed.trim();
    if (parsed && typeof parsed === "object") {
      const text = parsed.captcha ?? parsed.text ?? parsed.solution;
      if (typeof text === "string" && text.trim()) return text.trim();
      if (typeof parsed.error === "string") throw new Error(parsed.error);
    }
  } catch (error) {
    if (error instanceof SyntaxError) return result;
    throw error;
  }

  throw new Error("Captcha service returned an unexpected response.");
}

async function fetchProfile(sessionId) {
  const cookie = `JSESSIONID=${sessionId}`;
  const basicHeaders = {
    "User-Agent": "Mozilla/5.0",
    Accept: "text/html, */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
    Origin: "https://student.srmap.edu.in",
    Referer: `${BASE_URL}/HRDSystem`,
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Cookie: cookie,
  };

  await fetchOrThrow(`${BASE_URL}/HRDSystem`, {
    method: "POST",
    headers: basicHeaders,
  });

  const profileResponse = await fetchOrThrow(
    `${BASE_URL}/students/report/studentreportresources.jsp`,
    {
      method: "POST",
      headers: basicHeaders,
      body: new URLSearchParams({ ids: "1" }),
    }
  );
  const profileHtml = await profileResponse.text();
  const profile = {};

  for (const row of tableRows(profileHtml)) {
    if (row.length !== 3) continue;
    const [key, , value] = row;
    if (/Student Name/i.test(key)) profile.studentName = value;
    else if (/Register No/i.test(key)) profile.registerNo = value;
    else if (/Institution/i.test(key)) profile.institution = value;
    else if (/Semester/i.test(key)) profile.semester = value;
    else if (/Program\s*\/\s*Section/i.test(key)) {
      const [program, section] = value.split("/").map((part) => part.trim());
      profile.program = program;
      profile.section = section?.replace(/[\'"]+/g, "");
    } else if (/Specialization/i.test(key)) profile.specialization = value;
    else if (/D\.O\.B\.\s*\/\s*Gender/i.test(key)) {
      const [dob, gender] = value.split("/").map((part) => part.trim());
      profile.dob = dob;
      profile.gender = gender;
    } else if (/e-?mail/i.test(key)) profile.email = value;
  }

  if (!Object.keys(profile).length) {
    throw new Error("Could not read the student profile. Please sign in again.");
  }
  return profile;
}

async function login(registerNo, password) {
  const initialResponse = await fetchOrThrow(`${BASE_URL}/StudentLoginPage`, {
    method: "GET",
    headers: mainHeaders,
  });
  const sessionCookie = getCookies(initialResponse).find((cookie) =>
    /^JSESSIONID=/i.test(cookie)
  );
  if (!sessionCookie) throw new Error(UNREACHABLE);
  const sessionId = sessionCookie.slice(sessionCookie.indexOf("=") + 1);

  const captchaResponse = await fetchOrThrow(`${BASE_URL}/captchas`, {
    method: "GET",
    headers: {
      "User-Agent": mainHeaders["User-Agent"],
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "Accept-Language": "en-GB,en;q=0.5",
      Cookie: sessionCookie,
      Referer: `${BASE_URL}/StudentLoginPage`,
      "Sec-Fetch-Dest": "image",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "same-origin",
      "Sec-GPC": "1",
      "sec-ch-ua": mainHeaders["sec-ch-ua"],
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
    },
  });
  const captchaText = await solveCaptcha(
    Buffer.from(await captchaResponse.arrayBuffer())
  );

  const loginResponse = await fetchOrThrow(
    `${BASE_URL}/StudentLoginToPortal`,
    {
      method: "POST",
      headers: {
        ...mainHeaders,
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://student.srmap.edu.in",
        Referer: `${BASE_URL}/StudentLoginPage`,
        Cookie: sessionCookie,
      },
      body: new URLSearchParams({
        txtUserName: registerNo,
        txtAuthKey: password,
        ccode: captchaText,
      }),
    }
  );
  const loginHtml = await loginResponse.text();
  if (!/<h2\b[^>]*>[\s\S]*?<\/h2>/i.test(loginHtml)) {
    if (/\b(invalid|incorrect)\b/i.test(loginHtml)) {
      throw new Error("Invalid credentials");
    }
    throw new Error(UNREACHABLE);
  }

  return fetchProfile(sessionId);
}

async function verifyERPStudent({ registerNo, username, password } = {}) {
  const normalizedRegisterNo = String(registerNo || username || "")
    .trim()
    .toUpperCase();

  if (!normalizedRegisterNo || typeof password !== "string" || !password) {
    return {
      success: false,
      message: "Student registration number and portal password are required.",
    };
  }

  try {
    const student = await login(normalizedRegisterNo, password);
    const verifiedRegisterNo = String(student.registerNo || "")
      .trim()
      .toUpperCase();

    if (!verifiedRegisterNo || verifiedRegisterNo !== normalizedRegisterNo) {
      return {
        success: false,
        message: "The student portal profile did not match that registration number.",
      };
    }

    return {
      success: true,
      student: {
        studentName: String(student.studentName || "").trim(),
        registerNo: verifiedRegisterNo,
        institution: String(student.institution || "SRM AP").trim(),
        program: String(student.program || "").trim(),
        section: String(student.section || "").trim(),
        semester: String(student.semester || "").trim(),
        specialization: String(student.specialization || "").trim(),
        dob: String(student.dob || "").trim(),
        gender: String(student.gender || "").trim(),
        email: String(student.email || "").trim(),
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : UNREACHABLE,
    };
  }
}

module.exports = { verifyERPStudent };