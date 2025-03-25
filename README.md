# Trucking Insurance Landing Page

A responsive landing page for a trucking insurance company with an interactive form and animated features carousel.

![Trucking Insurance Landing Page](https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)

## Features

- **Responsive Design**: Fully responsive layout that works on mobile, tablet, and desktop screens
- **Interactive Form**: Form with real-time validation and visual feedback
- **Animated Features Carousel**: Mobile-friendly carousel that showcases benefits
- **Accessibility**: ARIA attributes and semantic HTML for better accessibility
- **Modern UI**: Clean, modern design with smooth animations and transitions

## Technologies Used

- HTML5
- CSS3 (with Tailwind CSS utility classes)
- JavaScript (ES6+)
- Font Awesome for icons

## Project Structure

```
trucking-insurance-landing/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## Implementation Details

### Responsive Typography

The project uses CSS `clamp()` function to create responsive typography that scales smoothly across different screen sizes:

```css
:root {
  --heading-responsive: clamp(2.5rem, 5vw + 1rem, 4rem);
}
```

### Form Validation

The form includes real-time validation with visual feedback:

- Email validation with regex pattern
- Name validation (minimum length)
- Phone number formatting and validation
- Visual feedback for all input states (focus, filled, error, disabled)

### Features Carousel

On mobile and tablet devices, the features section transforms into an interactive carousel:

- Auto-playing slides with pause on hover
- Navigation buttons for manual control
- Smooth transitions between slides
- Automatic conversion back to grid layout on desktop

## Best Practices Implemented

1. **Semantic HTML**: Using appropriate HTML elements for better accessibility and SEO
2. **Mobile-First Approach**: Designing for mobile first, then enhancing for larger screens
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
5. **Performance Optimization**: Hardware-accelerated animations and transitions
6. **Clean Code**: Well-organized, commented code for easier maintenance

## Running the Project

Simply open the `index.html` file in a modern web browser. No build steps or server setup required.

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Background image from [Unsplash](https://unsplash.com)
- Icons from [Font Awesome](https://fontawesome.com)
- Profile image from [Random User Generator](https://randomuser.me)
