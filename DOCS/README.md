
```text
src
├── app
│   └── (dashboard)
│       ├── layout.tsx
│       ├── (founder)
│       │   ├── analytics
│       │   │   └── index.tsx
│       │   ├── contracts
│       │   │   ├── analytics
│       │   │   │   └── page.tsx
│       │   │   └── genesis
│       │   │       └── index.tsx
│       │   └── submit-quest
│       │       └── page.tsx
│       └── ecosystem
│           └── projects
│               └── page.tsx
├── components
│   ├── app-sidebar.tsx
│   ├── nav-main.tsx
│   ├── nav-projects.tsx
│   ├── nav-secondary.tsx
│   ├── nav-user.tsx
│   └── ui
│       ├── breadcrumb.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       ├── popover.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── sidebar.tsx
│       ├── tabs.tsx
│       └── toast.tsx
├── hooks
│   ├── use-mobile.ts
│   ├── use-toast.ts
│   └── use-project-form.ts
└── services
    └── websocketService.ts
```

A suggested list of services and schemas to support the functions of the various sections:

1. **User Management Service**
   - **Functions:**
     - User authentication (login, logout, registration)
     - User profile management (view, edit)
     - User roles and permissions management
   - **Schema:**
     - User
       - id: String
       - name: String
       - email: String
       - avatar: String
       - role: String (e.g., admin, user)

2. **Navigation Service**
   - **Functions:**
     - Fetch navigation items for the main and secondary menus
     - Update navigation items dynamically based on user roles
   - **Schema:**
     - NavigationItem
       - id: String
       - title: String
       - url: String
       - icon: String
       - isActive: Boolean
       - items: Array<NavigationItem> (for sub-items)

3. **Project Management Service**
   - **Functions:**
     - Create, read, update, and delete (CRUD) projects
     - Manage project submissions (quests)
     - Fetch project details and statistics
   - **Schema:**
     - Project
       - id: String
       - name: String
       - description: String
       - logo: String
       - website: String
       - badges: Array<String>
       - createdBy: String (User ID)
       - createdAt: Date
       - updatedAt: Date

4. **Contract Management Service**
   - **Functions:**
     - Manage contracts (CRUD operations)
     - Fetch contract analytics and statistics
   - **Schema:**
     - Contract
       - id: String
       - title: String
       - description: String
       - createdBy: String (User ID)
       - createdAt: Date
       - updatedAt: Date
       - analytics: Object (e.g., total value locked, daily active users)

5. **Feedback and Support Service**
   - **Functions:**
     - Submit feedback and support requests
     - Fetch support articles and documentation
   - **Schema:**
     - Feedback
       - id: String
       - userId: String (User ID)
       - message: String
       - createdAt: Date
       - status: String (e.g., pending, resolved)

6. **Analytics Service**
   - **Functions:**
     - Fetch analytics data for projects and contracts
     - Generate reports based on user interactions and project performance
   - **Schema:**
     - AnalyticsData
       - id: String
       - projectId: String
       - date: Date
       - totalValueLocked: Number
       - dailyActiveUsers: Number
       - transactions: Number

7. **Real-time Updates Service**
   - **Functions:**
     - Manage WebSocket connections for real-time updates
     - Broadcast updates to connected clients
   - **Schema:**
     - UpdateMessage
       - id: String
       - type: String (e.g., projectUpdate, contractUpdate)
       - payload: Object (dynamic content based on the update type)

8. **Notification Service**
   - **Functions:**
     - Send notifications to users (e.g., project updates, feedback responses)
     - Manage notification preferences
   - **Schema:**
     - Notification
       - id: String
       - userId: String (User ID)
       - message: String
       - isRead: Boolean
       - createdAt: Date

---


```
src
├── app
│   └── (dashboard)
│       ├── layout.tsx  // Main layout for the dashboard, including sidebar and header.
│       ├── (founder)
│       │   ├── analytics
│       │   │   └── index.tsx  // Analytics page for the founder section.
│       │   ├── contracts
│       │   │   ├── analytics
│       │   │   │   └── page.tsx  // Analytics page for contracts.
│       │   │   └── genesis
│       │   │       └── index.tsx  // Genesis contract page.
│       │   └── submit-quest
│       │       └── page.tsx  // Page for submitting quests.
│       └── ecosystem
│           └── projects
│               └── page.tsx  // Projects page in the ecosystem section.
├── components
│   ├── app-sidebar.tsx  // Sidebar component for navigation.
│   ├── nav-main.tsx  // Main navigation component for the sidebar.
│   ├── nav-projects.tsx  // Navigation component for projects.
│   ├── nav-secondary.tsx  // Secondary navigation component for additional links.
│   ├── nav-user.tsx  // User navigation component for user-related actions.
│   └── ui
│       ├── breadcrumb.tsx  // Breadcrumb navigation component.
│       ├── card.tsx  // Card component for displaying content.
│       ├── dropdown-menu.tsx  // Dropdown menu component for actions.
│       ├── popover.tsx  // Popover component for displaying additional information.
│       ├── separator.tsx  // Separator component for visual separation.
│       ├── sheet.tsx  // Sheet component for modal-like overlays.
│       ├── skeleton.tsx  // Skeleton component for loading states.
│       ├── sidebar.tsx  // Sidebar UI components and context.
│       ├── tabs.tsx  // Tabs component for organizing content.
│       └── toast.tsx  // Toast notification component.
├── hooks
│   ├── use-mobile.ts  // Hook for detecting mobile device state.
│   ├── use-toast.ts  // Hook for managing toast notifications.
│   └── use-project-form.ts  // Hook for managing project form state.
└── services
    └── websocketService.ts  // Service for managing WebSocket connections.
```



The structure of the web application is organized into several key components, services, and hooks, which work together to create a cohesive user interface and functionality. Here's a breakdown of the main parts:

### 1. **App Structure**
- **`app` Directory**: This is the main entry point for the application, containing the layout and routing for different sections of the dashboard.
  - **`(dashboard)`**: This folder contains the layout and pages specific to the dashboard view.
    - **`layout.tsx`**: Defines the overall layout for the dashboard, including the sidebar and header.
    - **`(founder)`**: Contains pages related to the founder's functionalities, such as contracts and analytics.
    - **`ecosystem`**: Contains pages related to the ecosystem, such as projects.

### 2. **Components**
- **`components` Directory**: This folder contains reusable UI components that are used throughout the application.
  - **`app-sidebar.tsx`**: The sidebar component that includes navigation links for the main sections of the app.
  - **`nav-main.tsx`**: The main navigation menu for the sidebar, displaying primary sections like Contracts and Documentation.
  - **`nav-projects.tsx`**: A navigation component specifically for displaying project-related links.
  - **`nav-secondary.tsx`**: A secondary navigation component for additional links like Support and Feedback.
  - **`nav-user.tsx`**: A component for user-related actions, such as account settings and notifications.
  - **`ui`**: A subdirectory containing various UI components like buttons, cards, dropdowns, and sidebars.

### 3. **Hooks**
- **`hooks` Directory**: Contains custom hooks that encapsulate reusable logic.
  - **`use-mobile.ts`**: A hook to detect if the user is on a mobile device.
  - **`use-toast.ts`**: A hook for managing toast notifications.
  - **`use-project-form.ts`**: A hook for managing the state of project forms.

### 4. **Services**
- **`services` Directory**: Contains services that handle specific functionalities, such as API calls or WebSocket connections.
  - **`websocketService.ts`**: A service for managing WebSocket connections, allowing real-time updates.

### 5. **UI Components**
- **`ui` Directory**: Contains various UI components that are styled and reusable across the application.
  - **`sidebar.tsx`**: Contains the structure and logic for the sidebar, including its context and state management.
  - **`tabs.tsx`**: A component for creating tabbed interfaces.

### 6. **Project Management**
- **`founder/genesis`**: Contains components and pages related to project creation and management.
  - **`project-basic-info.tsx`**: A form component for entering basic project information.
  - **`project-form-context.tsx`**: Provides context for managing the state of the project form across multiple steps.

### 7. **Routing and Pages**
- Each page in the application is structured to handle specific routes, such as analytics, project submissions, and quests. These pages utilize the components and hooks defined in the application to render the necessary UI and handle user interactions.

### Summary
The application is structured in a modular way, allowing for easy maintenance and scalability. Each component, hook, and service has a specific role, contributing to the overall functionality and user experience of the application. The use of a sidebar for navigation, along with reusable UI components, enhances the consistency and usability of the interface.

---

```
src
├── app
│   └── (dashboard)
│       ├── layout.tsx  // Main layout component for the dashboard, including sidebar and header.
│       ├── (founder)
│       │   ├── analytics
│       │   │   └── index.tsx  // Analytics page for the founder section.
│       │   ├── contracts
│       │   │   ├── analytics
│       │   │   │   └── page.tsx  // Analytics page for contracts.
│       │   │   └── genesis
│       │   │       └── index.tsx  // Genesis contract page.
│       │   └── submit-quest
│       │       └── page.tsx  // Page for submitting quests.
│       └── ecosystem
│           └── projects
│               └── page.tsx  // Projects page in the ecosystem section.
├── components
│   ├── app-sidebar.tsx  // Sidebar component for the application, including navigation.
│   ├── nav-main.tsx  // Main navigation component for the sidebar.
│   ├── nav-projects.tsx  // Navigation component for projects in the sidebar.
│   ├── nav-secondary.tsx  // Secondary navigation component for additional links.
│   ├── nav-user.tsx  // User navigation component for user-related actions.
│   └── ui
│       ├── breadcrumb.tsx  // Breadcrumb navigation component.
│       ├── card.tsx  // Card component for displaying content.
│       ├── dropdown-menu.tsx  // Dropdown menu component for actions.
│       ├── popover.tsx  // Popover component for displaying additional information.
│       ├── separator.tsx  // Separator component for visual separation.
│       ├── sheet.tsx  // Sheet component for modal-like overlays.
│       ├── skeleton.tsx  // Skeleton component for loading states.
│       ├── sidebar.tsx  // Sidebar UI components and context.
│       ├── tabs.tsx  // Tabs component for organizing content.
│       └── toast.tsx  // Toast notification component.
├── hooks
│   ├── use-mobile.ts  // Hook for detecting mobile device state.
│   ├── use-toast.ts  // Hook for managing toast notifications.
│   └── use-project-form.ts  // Hook for managing project form state.
└── services
    └── websocketService.ts  // Service for managing WebSocket connections.
```