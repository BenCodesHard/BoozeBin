## **Environment instructions**

*very important will not work without*

 - Create a keys.js file in the /app folder
	 - Same folder as supabaseClient.js
 - Login to Supabase and navigate to the BoozeBin project
 - Scroll down until you see Project API
	 - This shows the Project URL (not secret) and API Key **(SECRET)**
 - In keys.js add these two lines
	 - export const SUPABASE_URL = ''
	 - export const SUPABASE_KEY = ''
 - Add the URL and key from Supabase to these variables
 - DONE!

## **Build instructions**

 - npm install next
	 - This installs next.js if you system doesn't have it already
 - npm run dev
