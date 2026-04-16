// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

const authMiddleware = async () => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return { userId: session.user.id };
};

export const ourFileRouter = {
  // Profile photo
  profileImage: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Business logo
  businessLogo: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Signature (image ya PDF)
  signature: f({ image: { maxFileSize: "1MB", maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Expense receipt
  expenseReceipt: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf:   { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
