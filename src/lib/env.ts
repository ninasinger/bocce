export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  appSecret: process.env.APP_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  driveFolderId: process.env.GDRIVE_FOLDER_ID || "",
  googleServiceAccountEmail: process.env.GDRIVE_CLIENT_EMAIL || "",
  googleServiceAccountKey: process.env.GDRIVE_PRIVATE_KEY || "",
  bootstrapKey: process.env.BOOTSTRAP_KEY || "",
  appUrl: process.env.APP_URL || "http://localhost:3000",
  googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
  googleOAuthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
  googleOAuthRedirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI || ""
};
