# Lakespra Archive UI/UX Blueprint
**Project ID:** `7023931797412098193`

This document outlines the design system and screen blueprint for the **Lakespra Archive** project based on the downloaded assets in the `designs/` directory.

## 1. Design Tokens & Styling

### Typography
- **Primary Font:** `Inter` (used for body text)
- **Heading Font:** `Plus Jakarta Sans` (for structural or highlighted headers)
- **Icons:** [Google Material Symbols Outlined](https://fonts.google.com/icons)

### Layout & Spacing
- **Max Width:** `1440px`
- **Desktop Margin:** `40px`
- **Mobile Margin:** `16px`
- **Gutter:** `24px`
- **Base Grid:** `4px`
- **Grid System:** 12-column bento-grid layout approach.

### Border Radius
- **Small:** `0.125rem` (2px)
- **Large:** `0.25rem` (4px)
- **Extra Large:** `0.5rem` (8px)
- **Full:** `0.75rem` (12px)

### Color Palette (Tailwind Custom Colors)
- **Primary/Surface:**
  - `primary`: `#000000`
  - `background` / `surface`: `#f7f9fb`
  - `surface-container-low`: `#f2f4f6`
  - `surface-container`: `#eceef0`
  - `surface-container-lowest`: `#ffffff`
- **Text & Content:**
  - `text-primary`: `#1E293B`
  - `text-secondary`: `#64748B`
- **Secondary & Accents:**
  - `secondary`: `#006a61`
  - `success`: `#059669`
  - `danger`: `#DC2626`

## 2. Screens Overview

### Dashboard Admin
- **ID:** `16b45111ca7b49f6b6978933c9f121a7`
- **HTML:** [dashboard_admin.html](file:///d:/Project/lakespra-archive/designs/dashboard_admin.html)
- **Image:** [dashboard_admin.png](file:///d:/Project/lakespra-archive/designs/dashboard_admin.png)
- **Description:** Main control panel for administrators to oversee document metrics, latest activities, and quick actions.

### Pencarian Publik (Guest)
- **ID:** `5ee90002984f4fdda7ef1ef0ff5e90f2`
- **HTML:** [pencarian_publik.html](file:///d:/Project/lakespra-archive/designs/pencarian_publik.html)
- **Image:** [pencarian_publik.png](file:///d:/Project/lakespra-archive/designs/pencarian_publik.png)
- **Description:** Public-facing search interface allowing guests to look up available archives with extensive scrolling and filtering.

### Input Dokumen Baru
- **ID:** `b574057559fd4c10b1277dd6f23f210a`
- **HTML:** [input_dokumen_baru.html](file:///d:/Project/lakespra-archive/designs/input_dokumen_baru.html)
- **Image:** [input_dokumen_baru.png](file:///d:/Project/lakespra-archive/designs/input_dokumen_baru.png)
- **Description:** Form interface for authorized personnel to input new documents into the archive system.

### Login Petugas
- **ID:** `902491b04ff348b1b94f5e94db634141`
- **HTML:** [login_petugas.html](file:///d:/Project/lakespra-archive/designs/login_petugas.html)
- **Image:** [login_petugas.png](file:///d:/Project/lakespra-archive/designs/login_petugas.png)
- **Description:** Authentication gateway for staff and administrators.

### Import Massal CSV
- **ID:** `f9cbef6fd0b94847ba4989b48f2d463a`
- **HTML:** [import_massal.html](file:///d:/Project/lakespra-archive/designs/import_massal.html)
- **Image:** [import_massal.png](file:///d:/Project/lakespra-archive/designs/import_massal.png)
- **Description:** Interface for batch uploading documents or records via CSV format.

*(Note: The Design System screen with ID `asset-stub-assets_ef3ef3f8f34643e394fe29700a77b228` could not be downloaded as it returned an invalid argument error, indicating it may be an asset reference rather than a standard renderable screen).*
