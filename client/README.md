# Pet Health - Frontend Application

## Project Title & Description

**Pet Health** is a web application for managing pet health records, vaccinations, and medical information. This frontend application provides two main user interfaces: one for veterinarians (doctors) to manage pet records and one for pet owners to view their pet's health information.

The system allows veterinarians to create, view, and delete pet records, while pet owners can access their pet's complete health history using their pet's microchip number.

## Tech Stack

- **React** (v18.3.1) - Frontend framework for building user interfaces
- **React Router DOM** (v6.30.0) - Client-side routing and navigation
- **Vite** (v5.4.14) - Build tool and development server
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework for styling
- **Axios** (v1.8.2) - HTTP client library (available in dependencies)
- **PostCSS** (v8.5.3) - CSS processing tool
- **Autoprefixer** (v10.4.21) - CSS vendor prefixing

## How to Install

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

## How to Run

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal output).

**Note:** Make sure the backend server is running on `http://localhost:5001` before using the application.

## Environment Variables

Create a `.env` file in the client directory with the following variable:

```
REACT_APP_API_URL=http://localhost:5001/api
```

See `.env.example` for the template.

**Important:** The `.env` file is included in `.gitignore` to prevent sensitive information from being committed to version control. Always create your own `.env` file based on `.env.example` and never commit actual environment variables to the repository.

## MVP Scope Explanation

This MVP (Minimum Viable Product) implementation focuses on the core user flows for pet health record management:

**Implemented Features:**
- **Home/Listing View**: Doctor dashboard displays a comprehensive list of all pet records in a table format with search/filtering capabilities
- **Admin/Management View**: Doctor dashboard allows full CRUD operations (Create new pets, Read/View all records, Delete existing pets)
- **Create Form**: Multi-step form (4 steps) for adding new pet records with validation:
  - Step 1: Pet Information (name, type, race, gender, birthdate, microchip, vaccinations, allergies)
  - Step 2: Owner Information
  - Step 3: Veterinarian Information
  - Step 4: Clinic Information
- **User Authentication**: Role-based access control with two user types:
  - **Doctor**: Username/password login to access admin dashboard
  - **Pet Owner**: Microchip number login to view pet records
- **Pet Owner View**: Pet owners can view their pet's complete health records including vaccinations, allergies, and contact information
- **Search/Filtering**: Doctors can search and filter pet records by name, type, race, owner, or microchip number

**Not Fully Implemented (Future Enhancements):**
- Edit/Update functionality for existing pet records (Delete is available)
- Advanced sorting options beyond filtering
- Detailed individual pet record view pages
- User profile management screens
- Additional admin management features (bulk operations, reports, etc.)
- Image upload for pets
- Vaccination reminder notifications

The MVP successfully demonstrates the main end-to-end flows: user authentication, listing records with filtering, creating new records with comprehensive validation, and viewing pet information from both doctor and pet owner perspectives.

## Project Structure

```
client/
├── src/
│   ├── App.jsx          # Main application component with routing
│   ├── main.jsx         # Application entry point
│   ├── index.css        # Global styles
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── PetOwnerDashboard.jsx
│   │   └── AddPetForm.jsx
│   ├── components/      # Reusable components
│   └── assets/          # Static assets
├── public/              # Public assets
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── .env.example         # Environment variables template
```

## Available Routes

- `/` - Login page (role selection)
- `/doctor/dashboard` - Doctor admin dashboard (pet records list)
- `/doctor/add-pet` - Add new pet form (multi-step)
- `/pet-owner/dashboard` - Pet owner view (pet information display)

## API Integration

The frontend integrates with the backend API at `http://localhost:5001/api`:

- **Authentication**: `POST /api/login` - Doctor login
- **Pets**: 
  - `GET /api/pets` - Fetch all pets (doctor)
  - `POST /api/pets` - Create new pet record
  - `DELETE /api/pets/:id` - Delete pet record
  - `GET /api/pets/microchip/:number` - Get pet by microchip number (pet owner)

## Development Notes

- The application uses localStorage for authentication token and user type
- Form validation is implemented client-side with error messages
- The UI uses a glassmorphism design with Tailwind CSS
- All API calls use the Fetch API (axios is available but not currently used)

