
# Task Management Application

This is a task management application built with React and TypeScript, utilizing Firebase for user authentication and Cloudinary for image storage. It features a task creation/editing system, task categorization, filtering, and the ability to upload and delete files. The app also supports a responsive design, offering a mobile-first experience.

## Technologies Used
- Frontend: React, TypeScript, Redux Toolkit, Redux Thunk, Shadcn UI
- Backend: Firebase (for user authentication), Cloudinary (for file storage)
- Styling: Tailwind CSS,

## Features
- Task Creation & Editing: Users can create, edit, and delete tasks, assign categories, and set due dates.
- Image Uploads: Attach Images to tasks and store them using Cloudinary.
- Drag-and-Drop Functionality: Users can change status by dragging into specific task type.
- Filters: Filter tasks by categories and date range. The application also supports search functionality.
- Activity Log: Track task changes such as creation & updates.
- Responsive Design: The app adapts to mobile, tablet, and desktop views.
- Task Board & List Views: Toggle between a Kanban-style board view and a list view.
- Batch Actions: Perform actions on multiple tasks simultaneously (delete, change status).

## How to Run the Project

### Prerequisites
- Node.js
- npm or yarn

### Installation


1. Clone the repository:


```bash
   git clone <repository-url>
   cd <project-directory>
```
2. Install Dependencies

```bash
   npm install
   npm run dev
```

3. Set up your Firebase project and Cloudinary account, and configure the respective credentials in the .env file:

- VITE_CLOUDINARY_CLOUD_NAME
- VITE_CLOUDINARY_API_KEY
- VITE_CLOUDINARY_UPLOAD_PRESET
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

2. Start the development server:

```bash
   npm run dev
```

5.Open the app in your browser at http://localhost:5173

## Challenges Faced and Solutions

1. Batch Select Task During Update:

- Problem: While updating tasks, batch selection wasn't working as expected.
- Solution: Debugged the issue and identified that the task ID was missing in the global state during the update. Added the task ID to the state for proper updates.

2. Cloudinary Image Deletion:

- Problem: Deleting images directly from the frontend was not possible due to CORS restrictions.
- Solution: Have just deleted from firebase database. The solution is to use backend.

3. Date Range Filter Not Showing Single Day Selection:

- Problem: The date range filter did not display results when selecting only a single day.
- Solution: Found that the default date value wasn't being picked up during task creation. Removed the default date setting to resolve the issue.
4. Incorrect Task Creation During Update:

- Problem: The global state was being used for both task creation and update, which led to task creation instead of updating the existing task.
- Solution: Used separate states for managing task creation and task update to ensure proper behavior.

