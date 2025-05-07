- Team Name: Team Lane 2
- Project Name: BoozeBin
- Team Members: Tommy Terry, Ben Sindberg, Sean Archibald, Tyler Wojtiuk

## **Environment instructions**

*very important will not work without*

 - Create a `.env` file in the root directory of the project
 - Login to Supabase and navigate to the BoozeBin project
 - Scroll down until you see Project API
	 - This shows the Project URL (not secret) and API Key **(SECRET)**
 - In the `.env` file add these two lines:
	 - NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
	 - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
 - Replace `your_supabase_url` and `your_supabase_key` with the URL and key from Supabase
 - Do the same with the gemini api key found in teams
 - Also need a key for unsplashed its in teams
 - DONE!

## **Build instructions**

 - npm install next
	 - This installs next.js if your system doesn't have it already
 - npm run dev

 **Might need to run these commands also**
 - npm install supabase
 - npm install @google/generative-ai
 - npm install dotenv
 
## **Testing instructions**
 - npm install jest
	- This installs jest if your system doesn't have it already
 - npm test
