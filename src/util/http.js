import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export async function fetchEvents({ signal, searchTerm, max }) {
  console.log(searchTerm);
  let url = "http://localhost:3000/events";
  // Base URL for fetching all events

  // Case 1: Both searchTerm and max are provided
  // Example: /events?search=concert&max=5
  // → This means "find events with 'concert' in them, limit results to 5"
  if (searchTerm && max) {
    url += "?search=" + searchTerm + "&max=" + max;
  }

  // Case 2: Only searchTerm is provided
  // Example: /events?search=concert
  // → This means "find all events with 'concert' in them"
  else if (searchTerm) {
    url += "?search=" + searchTerm;
  }

  // Case 3: Only max is provided
  // Example: /events?max=3
  // → This means "fetch only 3 events, no filtering"
  else if (max) {
    url += "?max=" + max;
  }

  // `?` starts query parameters
  // `=` assigns a value to the parameter (e.g., max=3)
  // `&` joins multiple parameters together (e.g., search=concert&max=5)

  // The `signal` allows React Query to cancel this fetch if a new request starts

  const response = await fetch(url, { signal: signal });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}
// Function to create a new event by sending data to the backend
export async function createNewEvent(eventData) {
  // Send a POST request to the backend with event data
  const response = await fetch("http://localhost:3000/events", {
    method: "POST", // HTTP method for creating new data
    body: JSON.stringify(eventData), // Convert event object into JSON string
    headers: {
      "Content-Type": "application/json", // Tell server the body contains JSON
    },
  });

  // If the response is not successful, handle the error
  if (!response.ok) {
    const error = new Error("An error occurred while creating this event");
    error.code = response.status; // Store HTTP status code (e.g. 400, 500)
    error.info = await response.json(); // Store extra error details from backend
    throw error; // Throw error so React Query or caller can handle it
  }

  // Extract the created event from the response JSON
  const { event } = await response.json();

  return event; // Return the new event object to the caller
}

// Fetch images from the backend for selection
export async function fetchSelectableImages({ signal }) {
  // Send GET request to backend, pass along the AbortController signal
  const response = await fetch("http://localhost:3000/events/images", {
    signal,
  });

  // If request failed, build a custom error object and throw it
  if (!response.ok) {
    const error = new Error("An error occurred while fetching images");
    error.code = response.status; // Store HTTP status code (e.g., 404, 500)
    error.info = await response.json(); // Store extra error info from backend
    throw error;
  }

  // If successful, extract "images" from the JSON response
  const { images } = await response.json();

  // Return the images so components can use them
  return images;
}

export async function fetchEvent({ id, signal }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    signal,
  });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the event");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();

  return event;
}

export async function deleteEvent({ id }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = new Error("An error occurred while deleting the event");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}

export async function updateEvent({ id, event }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    method: "PUT",
    body: JSON.stringify({ event }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("An error occurred while updating the event");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}
