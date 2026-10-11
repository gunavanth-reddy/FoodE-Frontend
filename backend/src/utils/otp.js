const crypto = require("crypto");

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
};

const getOTPExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000);
};

const otpMatches = (otp, storedHash) => {
  if (!otp || !storedHash) return false;

  const submittedHash = hashOTP(otp);
  const stored = String(storedHash);

  if (!/^[a-f0-9]{64}$/i.test(stored)) return false;

  return crypto.timingSafeEqual(
    Buffer.from(submittedHash, "hex"),
    Buffer.from(stored, "hex")
  );
};

module.exports = {
  generateOTP,
  hashOTP,
  getOTPExpiry,
  otpMatches,
};
