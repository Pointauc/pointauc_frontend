# Tutorial System - Business Requirements

## Overview

The tutorial system is designed to help users discover and learn how to use app features through interactive, step-by-step guides. Many users are unaware of certain features or don't know how to use them effectively. This system addresses that problem by providing contextual, guided tutorials that can be triggered in different ways depending on the feature's importance.

## Goals

1. **Increase feature discovery**: Help users find features they might not know exist
2. **Improve feature adoption**: Guide users through using features correctly
3. **Reduce support burden**: Provide self-service learning experiences
4. **Minimize user disruption**: Balance between promoting tutorials and respecting user flow

## Tutorial Start Methods

The system supports two ways to initiate a tutorial, allowing flexibility based on feature importance:

### 1. Modal Window Start (High Priority Features)

**When to use:** For major, important features where we really want users to check out the tutorial.

**Behavior:**
- Large modal window appears in the center of the screen
- Shows tutorial title and a short feature overview
- Presents two clear options:
  - "Start Tutorial" button - begins the interactive tutorial
  - "Close" or "Cancel" button - dismisses the modal
- Modal only appears once per user (tracked via localStorage)
- Can be re-triggered manually if user wants to review

**User Experience:**
- Intentionally interrupts the user's flow to draw attention
- Clear and prominent presentation
- Easy to dismiss if not interested

### 2. Notification Start (Lower Priority Features)

**When to use:** For smaller features where we don't want to interrupt the user's flow too much.

**Behavior:**
- Small notification appears at the bottom-right corner of the screen
- Shows tutorial title and brief message
- Clicking notification starts the tutorial
- Auto-dismisses after a set time (or can be manually closed)
- Only appears once per user (tracked via localStorage)

**User Experience:**
- Non-intrusive notification style
- Doesn't block main workflow
- Easy to ignore or dismiss
- Still brings attention to available help

## Tutorial Structure

### Multi-Step Format

Each tutorial consists of multiple sequential steps, where each step:

1. **Displays a popup** with:
   - Optional step title
   - Explanation content (text, images, or formatted content)
   - Progress indicator showing current step and total steps
   - Progress bar for visual progress tracking
   - "End Tutorial" button (always visible)
   - "Next Step" button (when applicable)
   - Required action description (for action-based steps)

2. **Highlights a specific element** (optional) using one of several methods:
   - Outline highlight: Animated border around the element
   - Background highlight: Semi-transparent overlay on the element
   - Spotlight: Dark overlay on entire screen with cutout around element
   - No highlight: Just show the popup without highlighting

3. **Positions the popup** flexibly:
   - Near a specific UI element with configurable offset
   - At predefined positions (center, top, bottom, left, right)
   - At absolute positions using CSS units (pixels, em, rem, percentages)

### Step Progression Methods

Users can advance through tutorial steps in two ways:

#### 1. Button-Based Progression

- User clicks "Next Step" button to proceed
- Simple and predictable
- Best for explanatory steps that don't require interaction

#### 2. Action-Based Progression

- User must perform a specific action to proceed (e.g., click a button, fill a form)
- The required action is clearly stated in the popup
- Action description is highlighted with special styling
- "Next Step" button is hidden during action-based steps
- Tutorial automatically advances when the action is completed

**Design principle:** Users should never be confused about what to do. The required action must be explicitly stated and visually emphasized.

## Element Highlighting

### Highlight Types

1. **Outline Highlight**
   - Animated border around the target element
   - Subtle pulse animation to draw attention
   - Configurable color (defaults to primary theme color)
   - Professional and non-intrusive

2. **Background Highlight**
   - Semi-transparent colored overlay on the element
   - Gentle fade animation
   - Configurable background color
   - Makes element stand out from surroundings

3. **Spotlight Effect**
   - Dark overlay covers entire screen
   - Cutout area around target element remains fully visible
   - Creates dramatic focus on the highlighted element
   - Best for critical or hard-to-find UI elements
   - Smooth transitions when moving between elements

4. **No Highlight**
   - Popup appears without highlighting any element
   - Useful for general explanations or multi-element steps

### Technical Implementation

- Highlights update dynamically as user scrolls or resizes window
- Elements are automatically scrolled into view if off-screen
- Spotlight cutout includes configurable padding around element
- All highlight styles are visually appealing and professional

## Popup Positioning

### Element-Relative Positioning

When positioned near a specific element:

- Supports 8 relative positions: top, bottom, left, right, top-left, top-right, bottom-left, bottom-right
- Configurable offset for fine-tuning (x and y coordinates)
- Automatically adjusts to stay within viewport bounds
- Repositions dynamically if element moves

### Predefined Positions

Five built-in positions for non-element-based steps:
- **Center**: Middle of the screen
- **Top**: Top center of the screen
- **Bottom**: Bottom center of the screen
- **Left**: Left center of the screen
- **Right**: Right center of the screen

### Absolute Positioning

For maximum control:
- Specify exact position using CSS units
- Support for top, bottom, left, right properties
- Can use pixels, em, rem, percentages, or any valid CSS unit

## Progress Tracking

### Completion Tracking

- Tutorial completion status is saved to localStorage
- Users won't see start prompts for completed tutorials
- Completion persists across browser sessions
- Users can manually restart tutorials if needed

### Dismissal Tracking

- If user dismisses a tutorial start prompt, it won't show again
- Separate from completion tracking
- Prevents annoying repeated prompts
- Can be reset programmatically if needed

## User Control

### Always Available Actions

1. **End Tutorial**: Users can cancel the tutorial at any moment using the "End Tutorial" button
2. **Close Start Prompt**: Users can decline to start a tutorial
3. **Dismiss Notification**: Users can dismiss notification-style prompts

### Design Principles

- Never force users to complete a tutorial
- Always provide clear exit options
- Respect user's choice to skip or dismiss
- Make it easy to find help when needed, but not intrusive when not

## Visual Design Requirements

### Professional Appearance

- Clean, modern design consistent with app aesthetic
- Smooth animations and transitions
- Readable text with good contrast
- Responsive to different screen sizes

### Accessibility

- Clear visual hierarchy
- High contrast for highlighted elements
- Readable font sizes
- No reliance on color alone to convey information

### Performance

- Smooth animations without janking
- Minimal impact on app performance
- Efficient DOM updates
- Proper cleanup when tutorials end

## Future Considerations

While not in the initial implementation, the system is designed to support:

- Analytics tracking for tutorial completion rates
- A/B testing different tutorial approaches
- Tutorial versioning (show updated tutorials to returning users)
- Multi-language tutorial content
- Tutorial branching (different paths based on user choices)
- Video or animated content in tutorial steps

