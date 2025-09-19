import {fetchEvents} from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { useQuery } from "@tanstack/react-query";
export default function NewEventsSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", {max: 3}], 
     //  unique identifier for caching. Includes { max: 3 } so React Query knows 
  // this request is specifically for "events with max=3"
    queryFn: ({signal, queryKey}) => fetchEvents({signal, ...queryKey[1]}), 
    //  calls fetchEvents with parameters (signal + { max: 3 })
    
    staleTime: 5000,  //set time to resend request for fetching data
    gcTime: 30000  //cached data will only be kept for 30 sec
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch events."}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
