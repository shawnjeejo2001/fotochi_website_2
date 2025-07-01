import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

const PROFILE_BUCKET = "profilepictures"
const PORTFOLIO_BUCKET = "portfoliopictures"

async function ensureBucketExists(bucketName: string) {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName)
    if (error) {
      if (error.message.includes("Bucket not found")) {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
        })

        if (error) {
          console.error("Error creating bucket:", error)
          throw error
        } else {
          console.log("Bucket created successfully:", bucketName)
        }
      } else {
        console.error("Error getting bucket:", error)
        throw error
      }
    } else {
      console.log("Bucket already exists:", bucketName)
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error)
    throw error
  }
}

export async function uploadProfilePicture(userId: string, file: File) {
  await ensureBucketExists(PROFILE_BUCKET)

  const fileName = `profile_${userId}`
  const { data, error } = await supabase.storage.from(PROFILE_BUCKET).upload(fileName, file, {
    cacheControl: "3600",
    upsert: true,
  })

  if (error) {
    console.error("Error uploading profile picture:", error)
    throw error
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${PROFILE_BUCKET}/${fileName}`
  return publicUrl
}

export async function getProfilePictureUrl(userId: string): Promise<string | null> {
  try {
    const fileName = `profile_${userId}`
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${PROFILE_BUCKET}/${fileName}`
    return publicUrl
  } catch (error) {
    console.error("Error getting profile picture URL:", error)
    return null
  }
}

export async function uploadPortfolioPicture(file: File) {
  await ensureBucketExists(PORTFOLIO_BUCKET)

  const fileName = `${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage.from(PORTFOLIO_BUCKET).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Error uploading portfolio picture:", error)
    throw error
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${PORTFOLIO_BUCKET}/${fileName}`
  return publicUrl
}

export async function deletePortfolioPicture(imageUrl: string) {
  try {
    const urlParts = imageUrl.split("/")
    const fileName = urlParts[urlParts.length - 1]

    const { data, error } = await supabase.storage.from(PORTFOLIO_BUCKET).remove([fileName])

    if (error) {
      console.error("Error deleting portfolio picture:", error)
      throw error
    }

    console.log("Portfolio picture deleted successfully:", fileName)
  } catch (error) {
    console.error("Error deleting portfolio picture:", error)
    throw error
  }
}
