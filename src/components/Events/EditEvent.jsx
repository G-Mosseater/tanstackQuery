import { Link, useNavigate, redirect } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";
import { useParams } from "react-router-dom";
import { useSubmit, useNavigation } from "react-router-dom";
// import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
export default function EditEvent() {
  const submit = useSubmit();
  const navigate = useNavigate();
  const { state } = useNavigation();
  const params = useParams();
  // Fetch a single event by ID

  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000
  });
  // optimistic updating
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   // Runs immediately when mutate() is called
  //   // Temporarily updates the cache before the server confirms
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     // Stop any outgoing fetches to avoid overwriting our changes

  //     await queryClient.cancelQueries({ queryKey: ["events", params.id] });
  //     // Save current data in case we need to roll back

  //     const previousEvent = queryClient.getQueryData(["events", params.id]);
  //     // Optimistically update the cache with new event data

  //     queryClient.setQueryData(["events", params.id], newEvent);
  //     // Return previous data so it can be restored on error

  //     return { previousEvent };
  //   },
  //   // If mutation fails, roll back to previous cached data

  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", params.id], context.previousEvent);
  //   },
  //   // After mutation settles (success or error), refetch to sync with server

  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events", params.id]);
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({ id: params.id, event: formData });
    // navigate("../");
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }
  let content;

  // if (isPending) {
  //   content = (
  //     <div className="center">
  //       <LoadingIndicator />
  //     </div>
  //   );
  // }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={error.info?.message || "Failed to load event"}
        />

        <div className="form-actions">
          <Link to="../">Okay</Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending Data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
export function loader({ params }) {
  // Preloads the event data *before* rendering the page
  // Uses React Query's fetchQuery to fetch and cache the event by ID
  return queryClient.fetchQuery({
    queryKey: ["events", params.id], // unique cache key for this event
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }), // HTTP call
  });
}

export async function action({ request, params }) {
  // Runs when the form is submitted with method="PUT"
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);

  // Send updated event data to the backend
  await updateEvent({ id: params.id, event: updatedEventData });

  // Invalidate cached events so list/details refetch fresh data
  await queryClient.invalidateQueries(["events"]);

  // Redirect user back to the parent route after update
  return redirect("../");
}
