---
name: scaffold-clean-architecture
description: Generates a 4-layer Clean Architecture structure for a new feature (Presentation, Application, Domain, Infrastructure).
---

# scaffold-clean-architecture

When the user asks you to create a new feature using Clean Architecture, follow these steps:

1. Determine the target application (`frontend`, `admin`, or `functions`) and the feature name (e.g., `market`, `players`).
2. Create the following folder structure inside the chosen app (e.g., `frontend/src/features/<featureName>/`):
   - `components/`: For purely presentational React components (.jsx)
   - `hooks/`: For business logic and state management (.js)
   - `views/`: For the main entry point page/screen of the feature (.jsx)
3. For Infrastructure/Firebase interaction, create services in `<app>/src/services/firebase/<featureName>/`.
4. Ensure you implement a Facade pattern in the `hooks/` layer if multiple Firebase services are involved.
5. Remind the user to update the router to include the new view.
