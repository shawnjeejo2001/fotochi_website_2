import { NextResponse } from "next/server"
import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export async function GET() {
  try {
    const bucketNames = ["profilepictures", "portfoliopictures"]

    for (const bucketName of bucketNames) {
      const createBucketCommand = new CreateBucketCommand({
        Bucket: bucketName,
      })

      try {
        await s3Client.send(createBucketCommand)
        console.log(`Bucket "${bucketName}" created successfully.`)
      } catch (error: any) {
        if (error.Code === "BucketAlreadyOwnedByYou") {
          console.log(`Bucket "${bucketName}" already exists and is owned by you.`)
        } else if (error.Code === "BucketAlreadyExists") {
          console.log(`Bucket "${bucketName}" already exists but is owned by someone else.`)
        } else {
          console.error(`Error creating bucket "${bucketName}":`, error)
          return NextResponse.json({ message: `Error creating bucket "${bucketName}": ${error}` }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ message: "Buckets created successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error creating buckets:", error)
    return NextResponse.json({ message: "Error creating buckets" }, { status: 500 })
  }
}
