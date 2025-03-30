if (
  location.pathname === "/" ||
  location.pathname === "/UNL/CSCE864-Project1/" ||
  location.pathname.includes("index.html")
) {
  document.addEventListener("DOMContentLoaded", function () {
    const eventContainer = document.getElementById("event-container");
    const regEventContainer = document.getElementById("reg-event-container");
    const events =
      JSON.parse(localStorage.getItem("events"))?.filter(
        (event) => !event.isRegistered
      ) || [];
    const regEvents =
      JSON.parse(localStorage.getItem("events"))?.filter(
        (event) => event.isRegistered
      ) || [];
    const feedbackEventIds =
      JSON.parse(localStorage.getItem("feedback"))?.map((event) =>
        parseInt(event.eventId)
      ) || [];

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
        eventCard.className = "card border-0";
        eventCard.innerHTML = `
        <img class="event-img" src="${event.imageURL}" />
        <div class="card-body d-flex flex-column gap-2 justify-content-between">
          <div>
            <h3 class="card-title">${event.title}</h3>
            <p class="card-text">${event.date} | ${event.location}</p>
            <p class="card-text event-description">${event.description}</p>
          </div>
          <a href="register.html?id=${event.id}" class="btn btn-primary">Register</a>
        </div>`;
        eventContainer.appendChild(eventCard);
      });
    }

    function displayRegisteredEvents() {
      regEventContainer.innerHTML = "";
      regEventContainer.classList.remove("d-grid", "gap-2", "event-container");

      if (regEvents.length === 0) {
        regEventContainer.innerHTML = `<p class="text-center">You are not registered for any event</p>`;
        return;
      }

      regEventContainer.classList.add("d-grid", "gap-2", "event-container");
      regEvents.forEach((event) => {
        let eventCard = document.createElement("div");
        eventCard.className = "card border-0";
        eventCard.innerHTML = `
            <img class="event-img" src="${event.imageURL}" />
            <div class="card-body d-flex flex-column gap-2 justify-content-between">
              <div>
                <h3 class="card-title">${event.title}</h3>
                <p class="card-text">${event.date} | ${event.location}</p>
                <p class="card-text event-description">${event.description}</p>
              </div>
                ${
                  feedbackEventIds.includes(event.id)
                    ? ""
                    : `<a href="feedback.html?id=${event.id}" class="btn btn-primary">Give Feedback</a>`
                }
            </div>`;
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
      let imageURL = document.getElementById("imageURL").value;

      if (!title || !date || !location || !description || !imageURL) {
        alert("All fields are required!");
        return;
      }

      const events = JSON.parse(localStorage.getItem("events")) || [];
      const newEvent = {
        id: Date.now(),
        title,
        date,
        location,
        description,
        imageURL,
        isRegistered: false,
      };

      events.push(newEvent);
      localStorage.setItem("events", JSON.stringify(events));

      alert("Event Created Successfully!");
      window.location.href = "index.html";
    });
}

if (location.pathname.includes("register.html")) {
  document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const selectedEvent = events.find((event) => event.id == eventId);

    if (selectedEvent) {
      document.getElementById(
        "event-title"
      ).innerText = `Register for ${selectedEvent.title}`;
    } else {
      alert("Event not found.");
      window.location.href = "index.html";
    }
  });

  document
    .getElementById("register-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const eventId = new URLSearchParams(window.location.search).get("id");
      let events = JSON.parse(localStorage.getItem("events")) || [];

      if (!name || !email) {
        alert("Name and Email are required!");
        return;
      }

      events = events.map((event) =>
        event.id == eventId ? { ...event, isRegistered: true } : event
      );

      localStorage.setItem("events", JSON.stringify(events));
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

      const name = document.getElementById("name").value;
      const comment = document.getElementById("comment").value;
      const eventId = new URLSearchParams(window.location.search).get("id");
      const feedbackList = JSON.parse(localStorage.getItem("feedback")) || [];

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

if (location.pathname.includes("feedbacks.html")) {
  document.addEventListener("DOMContentLoaded", function () {
    const feedbackContainer = document.getElementById("feedback-container");
    const feedbacks = JSON.parse(localStorage.getItem("feedback")) || [];

    function displayFeedbacks() {
      feedbackContainer.innerHTML = "";
      feedbackContainer.classList.remove(
        "d-grid",
        "gap-2",
        "feedback-container"
      );

      if (feedbacks.length === 0) {
        feedbackContainer.innerHTML = `<p class="text-center mt-4">No Feedbacks provided yet</p>`;
        return;
      }

      feedbackContainer.classList.add("d-grid", "gap-2", "feedback-container");
      feedbacks.forEach((feedback) => {
        const feedbackCard = document.createElement("div");
        const event = JSON.parse(localStorage.getItem("events")).find(
          (event) => event.id == feedback.eventId
        );
        feedbackCard.className = "card";
        feedbackCard.innerHTML = `
            <div class="card-body d-flex flex-column">
                <h3 class="card-title">${feedback.name}</h3>
                <p class="card-text mb-1"><strong>Event: </strong>${event.title}</p>
                <p class="card-text mb-1"><strong>Rating: </strong> 
                  <span class="rating-container-${feedback.eventId}">
                    <span class="fa fa-star"></span>
                    <span class="fa fa-star"></span>
                    <span class="fa fa-star"></span>
                    <span class="fa fa-star"></span>
                    <span class="fa fa-star"></span>
                  </span>
                </p>
                <p class="card-text mb-"><strong>Comment: </strong>${feedback.comment}</p>
            </div>
                `;
        feedbackContainer.appendChild(feedbackCard);

        function addRating() {
          const ratingContainer = document.querySelector(
            `.rating-container-${feedback.eventId}`
          );
          Array.from(ratingContainer.children)
            .slice(0, feedback.rating)
            .map((el) => el.classList.add("checked"));
        }
        addRating();
      });
    }
    displayFeedbacks();
  });
}
