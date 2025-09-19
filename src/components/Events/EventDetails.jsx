import { Link, Outlet } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "../Header.jsx";
import { fetchEvent, queryClient } from "../../util/http.js";
import { useParams } from "react-router-dom";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { deleteEvent } from "../../util/http.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";
export default function EventDetails() {
  // State to track whether the delete confirmation modal is open

  const [isDeleting, setIsDeleting] = useState(false);

  const params = useParams(); // Get event ID from the URL
  const navigate = useNavigate(); // For redirecting user after delete

  // Fetch a single event by ID

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id], // cache key for this event
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  // Mutation for deleting an event
  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent, // function that calls DELETE request
    onSuccess: () => {
      // When delete is successful:
      queryClient.invalidateQueries({
        queryKey: ["events"], // refresh cached event list
        refetchType: "none", // don’t force refetch if not needed
      });
      navigate("/events"); // redirect back to events list
    },
  });
  // Called when the user clicks "Delete" to start the deletion process

  function handleStartDelete() {
    setIsDeleting(true);
  }

  // Called when the user clicks "Cancel" in the confirmation modal

  function handleStopDelete() {
    setIsDeleting(false);
  }
  // Called when the user confirms deletion in the modal

  // Handler for the delete button
  function handleDelete() {
    mutate({ id: params.id }); // send event ID to deleteEvent
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching event data</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Failed to load event"
          message={error.info?.message || "Falied to fetch event data"}
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{data.title} </h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description"> {data.description} </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2> Are you sure?</h2>
          <p> Do you really want to delete this event?!</p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting, please wait...</p>}

            {!isPendingDeletion && (
              <>
                <button onClick={handleStopDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
              </>
            )}
          </div>

          {isErrorDeleting && (
            <ErrorBlock
              title="failed to delete event"
              message={deleteError.info?.message || "Failed to delete"}
            />
          )}
        </Modal>
      )}

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
