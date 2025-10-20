# 🍸 BoozeBin

**BoozeBin** is a web app that recommends cocktail recipes based on the ingredients you have at home. Users can upload an image of their ingredients, and the app uses Google’s Gemini API to recognize them and suggest drinks accordingly.

---

## 👨‍💻 Team
**Team Lane 2**  
- Tommy Terry  
- Ben Sindberg  
- Sean Archibald  
- Tyler Wojtiuk  

Developed as part of a university software engineering project at **UW–Platteville**.

---

## ⚙️ Features
- Ingredient detection using **Google Gemini API**
- Cocktail image pairing via **Unsplash API**
- User authentication and ingredient storage with **Supabase**
- Built using **Next.js** and **React**
- Full-stack architecture with cloud database integration

---

## 🧠 Tech Stack
- **Frontend:** React, Next.js  
- **Backend:** Supabase (PostgreSQL)  
- **APIs:** Google Gemini, Unsplash  
- **Languages:** JavaScript, SQL  

---

## **Environment instructions** - (Supabase Database was deleted from project inactivity)

*very important will not work without*

 - Create a `.env` file in the root directory of the project
 - Login to Supabase and navigate to the BoozeBin project
 - Scroll down until you see Project API
	 - This shows the Project URL (not secret) and API Key **(SECRET)**
 - In the `.env` file add these two lines:
	 - NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
	 - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
 - Replace `your_supabase_url` and `your_supabase_key` with the URL and key from Supabase
 - Do the same with these keys as well (found in teams): Google Gemini and Unsplashed.
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
