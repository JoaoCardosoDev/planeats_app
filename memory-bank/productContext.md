# Product Context

*This document describes the "why" behind the project, the problems it aims to solve, its intended functionality, and user experience goals. It is primarily based on information from the Project Brief.*

## 1. "Why" - Project Origin and Goals

-   **Origin**: The PlanEats project stems from an initial pitch developed in the "Pitching e Empreendedorismo" module. The primary goal is to transform this concept into a functional Minimum Viable Product (MVP).
-   **Core Objective**: To develop a web application that aids users in comprehensive pantry management and recipe recommendation. This involves helping users manage their food inventory, reduce food waste, and discover recipes based on available ingredients and personal preferences, including AI-generated personalized recipes.
-   **Overall Aim**: To create an MVP that integrates a clear business value proposition with a robust technical implementation, effectively turning the initial concept into a working application that addresses both technical and business aspects.

## 2. Problems to Solve

PlanEats aims to address several common household challenges:
-   **Food Waste**: Difficulty in tracking pantry items and their expiry dates often leads to food being discarded unnecessarily.
-   **Meal Planning Difficulty**: Users often struggle with deciding what to cook based on the ingredients they currently have on hand.
-   **Managing Dietary Preferences**: Catering to individual or household dietary restrictions and goals (e.g., calorie targets, allergies, specific diets) can be complex.
-   **Recipe Discovery**: Finding new and suitable recipes that match available ingredients and preferences can be time-consuming.

## 3. Intended Functionality (Core MVP Features)

The PlanEats MVP will focus on delivering the following key functionalities:

-   **User Authentication**:
    -   Secure user registration and login (JWT-based).
-   **Pantry Management**:
    -   Adding, listing, updating, and deleting pantry items.
    -   Tracking item details: name, quantity, unit, expiration date, purchase date, calories.
    -   Filtering and sorting options for easy inventory overview.
-   **Recipe Management**:
    -   Listing available recipes (system-provided and user-added).
    -   Viewing recipe details: instructions, ingredients, calories, preparation time, image.
    -   Allowing users to add their own recipes.
    -   Filtering options for recipes.
-   **Recipe Recommendations**:
    -   Suggesting recipes based on items currently in the user's pantry.
    -   Filtering recommendations by criteria such as calorie count or ingredients nearing expiry.
-   **AI-Powered Personalized Recipes**:
    -   Integration with the Gemini API (via backend) to request and generate custom recipes based on user inputs (e.g., available ingredients, dietary needs).
-   **User Preferences**:
    -   Allowing users to define and update their dietary goals and restrictions, which will influence recipe recommendations and AI generation.

## 4. User Experience Goals

-   **Intuitive Management**: Provide a simple and clear interface for managing pantry items and recipes.
-   **Efficiency**: Help users quickly find what they need, whether it's an item in their pantry or a recipe suggestion.
-   **Reduced Cognitive Load**: Automate aspects of meal planning and food management to make users' lives easier.
-   **Personalization**: Offer tailored recipe suggestions and AI-generated recipes that align with individual user needs and available stock.
-   **Waste Reduction Awareness**: Implicitly encourage less food waste by making users more aware of their inventory and suggesting ways to use items.
-   **Empowerment**: Give users better control over their food consumption, dietary choices, and meal preparation.
