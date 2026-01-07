# מדריך העלאת האתר לאוויר (Deployment) 🚀

כדי להפוך את המשחק לזמין לכולם באינטרנט באופן קבוע, אנחנו צריכים להעלות אותו לשרתים. התהליך מורכב משלושה שלבים עיקריים:
1.  **הכנה**: התקנת Git והעלאת הקוד ל-GitHub.
2.  **שרת (Backend)**: העלאת השרת ל-Render.
3.  **לקוח (Frontend)**: העלאת האתר ל-Vercel.

---

## שלב 1: התקנת Git והעלאה ל-GitHub 🛠️

מכיוון שאין לך Git מותקן במחשב, זה השלב הראשון. רוב שירותי הענן דורשים את הקוד ב-GitHub.

### 1. התקנת Git
1.  הורד את Git מכאן: [git-scm.com/downloads](https://git-scm.com/downloads) (גרסת Windows 64-bit).
2.  התקן אותו (פשוט תלחץ Next על הכל).
3.  אחרי ההתקנה, **סגור את ה-VS Code ואת הטרמינל ותפתח מחדש** כדי שהמחשב יזהה את הפקודה.

### 2. פתיחת חשבון GitHub
אם אין לך, פתח חשבון בחינם ב-[github.com](https://github.com).

### 3. יצירת מאגר (Repository) והעלאת הקוד
1.  באתר של GitHub, לחץ על **New Repository** (בצד שמאל למעלה או בתפריט ה-+).
2.  תן לו שם (למשל `poker-club`).
3.  בחר **Public** (ציבורי) או **Private** (פרטי).
4.  לחץ **Create repository**.

עכשיו, בטרמינל של הפרויקט שלך (בתוך VS Code), הרץ את הפקודות הבאות אחת אחרי השנייה:

```bash
# 1. אתחול
git init

# 2. הוספת כל הקבצים
git add .

# 3. שמירת הגרסה
git commit -m "Initial upload"

# 4. חיבור ל-GitHub (תעתיק את הפקודה המדויקת ש-GitHub נותן לך במסך שנוצר, היא נראית ככה בערך:)
# git remote add origin https://github.com/YourUsername/poker-club.git

# 5. דחיפה לענן
git branch -M main
git push -u origin main
```

---

## שלב 2: העלאת השרת (Render) 🗄️

אנחנו נשתמש ב-Render לאירוח השרת (החלק שמנהל את המשחק).

1.  הרשם ל-[render.com](https://render.com) (אפשר עם חשבון ה-GitHub שלך).
2.  לחץ על **New +** ובחר **Web Service**.
3.  חבר את חשבון ה-GitHub שלך ובחר את ה-Repository שיצרת (`poker-club`).
4.  הגדר את השדות הבאים:
    *   **Name**: `poker-server` (או כל שם שתרצה).
    *   **Root Directory**: `server` (חשוב מאוד!).
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install && npm run build` (או פשוט `npm install`).
    *   **Start Command**: `npm start` (או `node dist/index.js`).
5.  גלול למטה ל-**Environment Variables** והוסף:
    *   `JWT_SECRET`: תכתוב ססמה ארוכה ומסובכת כלשהי.
    *   `NODE_ENV`: `production`
6.  לחץ **Create Web Service**.

*הערה חשובה: בגרסה החינמית של Render, השרת "נרדם" אם לא משתמשים בו, ולוקח לו דקה להתעורר בכניסה הראשונה. כמו כן, מסד הנתונים (SQLite) מתאפס בכל פעם שהשרת עולה גרסה מחדש. לפתרון קבוע צריך מסד נתונים חיצוני (כמו PostgreSQL).*

---

## שלב 3: העלאת האתר (Vercel) 🌐

אנחנו נשתמש ב-Vercel לאירוח האתר עצמו (מה שהשחקנים רואים).

1.  הרשם ל-[vercel.com](https://vercel.com).
2.  לחץ **Add New...** > **Project**.
3.  ייבא את ה-Repository שלך מ-GitHub.
4.  הגדרות:
    *   **Framework Preset**: Vite (אמור לזהות לבד).
    *   **Root Directory**: לחץ Edit ובחר בתיקיית `client`.
5.  ב-**Environment Variables**:
    *   שם: `VITE_API_URL`
    *   ערך: הכתובת שקיבלת מ-Render בשלב הקודם (למשל `https://poker-server.onrender.com`). **חשוב:** בלי לוכסן (`/`) בסוף.
6.  לחץ **Deploy**.

---

## סיימנו! 🎉
בסוף התהליך ב-Vercel תקבל קישור (למשל `poker-club.vercel.app`).
זה הקישור שאתה שולח לחברים בוואטסאפ! לשחקנים אין צורך להתקין כלום.
