if (location.pathname.includes("index.html")) {
  document.addEventListener("DOMContentLoaded", function () {
    const eventContainer = document.getElementById("event-container");
    const regEventContainer = document.getElementById("reg-event-container");

    const events = JSON.parse(localStorage.getItem("events")) || [];

    function displayEvents() {
      eventContainer.innerHTML = "";
      eventContainer.classList.remove("d-grid", "gap-2", "event-container");

      if (events.length === 0) {
        eventContainer.innerHTML = `<p class="text-center">No events scheduled</p>`;
        return;
      }

      eventContainer.classList.add("d-grid", "gap-2", "event-container");
      events.forEach((event) => {
        let eventCard = document.createElement("div");
        eventCard.className = "card";
        eventCard.innerHTML = `
            <div class="card-body d-flex flex-column gap-2 justify-content-between">
                <div>
                    <h3 class="card-title">${event.title}</h3>
                    <p class="card-text">${event.date} | ${event.location}</p>
                    <p class="card-text">${
                      event.description.length > 100
                        ? `${event.description.slice(0, 100)}...`
                        : event.description
                    }</p>
                </div>
                <a href="event.html?id=${
                  event.id
                }" class="btn btn-primary">View Details</a>
            </div>
                `;
        eventContainer.appendChild(eventCard);
      });
    }

    function displayRegisteredEvents() {
      const regEventIds =
        JSON.parse(localStorage.getItem("registrations"))?.map((event) =>
          parseInt(event.eventId)
        ) || [];
      const regEvents = events.filter((event) =>
        regEventIds.includes(event.id)
      );
      const feedbackEventIds =
        JSON.parse(localStorage.getItem("feedback"))?.map((event) =>
          parseInt(event.eventId)
        ) || [];

      regEventContainer.innerHTML = "";
      regEventContainer.classList.remove("d-grid", "gap-2", "event-container");

      if (regEvents.length === 0) {
        regEventContainer.innerHTML = `<p class="text-center">You are not registered for any event</p>`;
        return;
      }

      regEventContainer.classList.add("d-grid", "gap-2", "event-container");
      regEvents.forEach((event) => {
        let eventCard = document.createElement("div");
        eventCard.className = "card";
        eventCard.innerHTML = `
            <div class="card-body d-flex flex-column gap-2 justify-content-between">
                <div>
                    <h3 class="card-title">${event.title}</h3>
                    <p class="card-text">${event.date} | ${event.location}</p>
                    <p class="card-text">${
                      event.description.length > 100
                        ? `${event.description.slice(0, 100)}...`
                        : event.description
                    }</p>
                </div>
                <a href="event.html?id=${
                  event.id
                }" class="btn btn-primary">View Details</a>
                ${
                  feedbackEventIds.includes(event.id)
                    ? ""
                    : `<a href="feedback.html?id=${event.id}" class="btn btn-primary">Give Feedback</a>`
                }
            </div>
                `;
        regEventContainer.appendChild(eventCard);
      });
    }

    displayEvents();
    displayRegisteredEvents();
  });
}

if (location.pathname.includes("createEvent.html")) {
  document
    .getElementById("event-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();

      let title = document.getElementById("title").value;
      let date = document.getElementById("date").value;
      let location = document.getElementById("location").value;
      let description = document.getElementById("description").value;

      if (!title || !date || !location || !description) {
        alert("All fields are required!");
        return;
      }

      let events = JSON.parse(localStorage.getItem("events")) || [];
      let newEvent = {
        id: Date.now(),
        title,
        date,
        location,
        description,
      };

      events.push(newEvent);
      localStorage.setItem("events", JSON.stringify(events));

      alert("Event Created Successfully!");
      window.location.href = "index.html";
    });
}

if (location.pathname.includes("event.html")) {
  document.addEventListener("DOMContentLoaded", function () {
    let params = new URLSearchParams(window.location.search);
    let eventId = params.get("id");
    let events = JSON.parse(localStorage.getItem("events")) || [];
    let regEventIds =
      JSON.parse(localStorage.getItem("registrations")).map(
        (event) => event.eventId
      ) || [];
    let selectedEvent = events.find((event) => event.id == eventId);
    let regFormSection = document.getElementById("register-form-section");
    const isRegisteredEvent = regEventIds.includes(eventId);

    if (selectedEvent) {
      document.getElementById("event-title").innerText = selectedEvent.title;
      document.getElementById("event-date").innerText = selectedEvent.date;
      document.getElementById("event-location").innerText =
        selectedEvent.location;
      document.getElementById("event-description").innerText =
        selectedEvent.description;
    } else {
      document.getElementById("event-details").innerHTML =
        "<p>Event not found.</p>";
    }

    regFormSection.style.display = isRegisteredEvent ? "none" : "block";
  });

  document
    .getElementById("register-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      let name = document.getElementById("name").value;
      let email = document.getElementById("email").value;
      let eventId = new URLSearchParams(window.location.search).get("id");

      if (!name || !email) {
        alert("Name and Email are required!");
        return;
      }

      let registrations =
        JSON.parse(localStorage.getItem("registrations")) || [];
      registrations.push({ eventId, name, email });

      localStorage.setItem("registrations", JSON.stringify(registrations));
      alert("You have successfully registered for the event!");
      window.location.href = "index.html";
    });
}

if (location.pathname.includes("feedback.html")) {
  const ratingContainer = document.querySelector(".rating-container");
  let rating = 0;
  document
    .getElementById("feedback-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      let name = document.getElementById("name").value;
      let comment = document.getElementById("comment").value;
      let eventId = new URLSearchParams(window.location.search).get("id");

      let feedbackList = JSON.parse(localStorage.getItem("feedback")) || [];
      feedbackList.push({ eventId, name, rating, comment });

      localStorage.setItem("feedback", JSON.stringify(feedbackList));
      alert("Thanks for your feedback!");
      window.location.href = "index.html";
    });

  function updateRating(value) {
    rating = value;
    Array.from(ratingContainer.children).map((el) =>
      el.classList.remove("checked")
    );
    Array.from(ratingContainer.children)
      .slice(0, value)
      .map((el) => el.classList.add("checked"));
  }
}
