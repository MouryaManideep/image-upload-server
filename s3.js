require("dotenv").config();

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// 🔥 Check if AWS env exists
const isAWSConfigured =
  process.env.AWS_REGION &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET;

let s3;

if (isAWSConfigured) {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
} else {
  console.log("⚠️ AWS not configured (CI mode)");
}

// ✅ Safe upload function
const uploadFile = async (file, fileName) => {
  if (!isAWSConfigured) {
    // CI fallback
    return "CI_TEST_URL";
  }

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(params));

  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

module.exports = uploadFile;