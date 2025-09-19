import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query"; // for sending data to backend
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { createNewEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../util/http.js";
export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent, // Function that sends new event data to backend
    onSuccess: () => {
      // When the event is created successfully:
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // 🔄 This tells React Query to refetch the "events" list so it stays up to date

      navigate("/events");
      // 🚀 Redirect user back to the events page
    },
  });

  // Called when the EventForm is submitted

  function handleSubmit(formData) {
    // Pass form data to the mutation
    // wrapped in an object (event: formData) to match backend expectations
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submitting..."}

        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>

      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={error.info?.message || "Failed to create event."}
        />
      )}
    </Modal>
  );
}
