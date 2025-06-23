# UoBD Project - Healthcare Mobile App

A comprehensive healthcare mobile application built with React Native, featuring doctor search, health metrics tracking, and AI-powered health assistance.

## Features

- Doctor search by specialty
- Health metrics tracking
- AI health assistant
- Medical records management
- Vaccination records
- Interactive maps integration
- Real-time chat with health professionals

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/UoBD-Project.git
cd UoBD-Project
```

2. Install dependencies:
```bash
npm install
```

3. Environment Setup:
   - Create a `.env` file in the root directory
   - Add your API keys:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the development server:
```bash
npm start
```

## Environment Variables

The following environment variables are required:

- `GOOGLE_MAPS_API_KEY`: Google Maps API key for location services
- `GEMINI_API_KEY`: Gemini API key for AI health assistant

## Project Structure

```
UoBD-Project/
├── mobile/              # React Native app
│   ├── src/
│   │   ├── screens/    # Screen components
│   │   ├── config/     # Configuration files
│   │   ├── context/    # React Context
│   │   └── navigation/ # Navigation setup
│   ├── assets/         # Images and assets
│   └── App.js          # Root component
└── backend/            # Backend services
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## Security Note

Never commit sensitive information like API keys directly to the repository. Always use environment variables for sensitive data.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 