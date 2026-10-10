const crypto = require("crypto");

const generateOTP = () => crypto.randomInt(100000, 1000000).toString();
const hashOTP = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");
const getOTPExpiry = () => new Date(Date.now() + 5 * 60 * 1000);

const otpMatches = (candidate, storedHash) => {
  const candidateHash = Buffer.from(hashOTP(candidate), "hex");
  let stored;
  try {
    stored = Buffer.from(String(storedHash), "hex");
  } catch {
    return false;
  }
  return candidateHash.length === stored.length && crypto.timingSafeEqual(candidateHash, stored);
};

module.exports = { generateOTP, hashOTP, getOTPExpiry, otpMatches };
