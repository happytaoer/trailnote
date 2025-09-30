# TrailNote - Your Ultimate Adventure Planning Tool

TrailNote is a feature-rich, map-centric web application designed for outdoor enthusiasts to plan, track, and document their adventures. From marking points of interest to drawing custom routes, TrailNote provides a comprehensive toolset for your next journey.

## ✨ Features

- **Project-Based Organization**: Group your maps, markers, and routes into distinct projects.
- **Interactive Map**: A fully interactive map interface powered by Leaflet.
- **Markers & Routes**: Create, edit, and delete custom markers (points of interest) and routes.
- **Freehand Drawing**: Draw your path directly on the map with a freehand drawing tool.
- **Image Uploads**: Attach images to your markers and routes, either by uploading from your device or linking an external URL.
- **Custom Styling**: Customize default route color, width, and opacity in your user settings.
- **State Management**: Robust client-side state management using Zustand for a seamless and fast user experience.
- **User Authentication**: Secure user authentication and data management powered by Supabase.
- **Resizable Sidebar**: Adjust the sidebar width to your liking for a personalized layout.
- **Search Functionality**: Easily search for locations using the integrated Mapbox Geocoding API.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Supabase](https://supabase.io/)
- **Mapping**: [Leaflet](https://leafletjs.com/), [React Leaflet](https://react-leaflet.js.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: [Ant Design](https://ant.design/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/trailnote.git
cd trailnote
```

### 2. Set Up Environment Variables

This project uses Supabase for its backend. You will need to create a Supabase project and get your API keys.

1.  Create a `.env.local` file in the root of the project.
2.  Add your Supabase URL and Anon Key to the file:

    ```
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up the Database

The SQL migration files are located in the `/sql` directory. You can run these against your Supabase database to set up the required tables and policies.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can now start developing!
