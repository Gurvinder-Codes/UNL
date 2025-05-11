// check if user is logged in
if (
  !location.pathname.includes("register.html") &&
  !location.pathname.includes("login.html")
) {
  fetch("assets/php/index.php?action=checkLoginStatus")
    .then((res) => res.json())
    .then((data) => {
      if (!data.loggedIn) {
        window.location.href = "login.html";
      }
    })
    .catch((err) => {
      console.error("Session check failed:", err);
      window.location.href = "login.html";
    });
}

// register user
if (location.pathname.includes("register.html")) {
  document
    .getElementById("registerForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const regMsgEl = document.getElementById("registerMessage");

      const response = await fetch("assets/php/register.php", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();

      regMsgEl.innerText = result;
      if (result === "Registered successfully!") {
        regMsgEl.classList.remove("text-danger");
        setTimeout(() => {
          location.href = "login.html";
        }, 500);
      } else {
        regMsgEl.classList.add("text-danger");
      }
    });
}

// login user
if (location.pathname.includes("login.html")) {
  document.getElementById("loginForm").onsubmit = async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const loginMsgEl = document.getElementById("loginMessage");

    const response = await fetch("assets/php/login.php", {
      method: "POST",
      body: formData,
    });
    const result = await response.text();
    loginMsgEl.innerText = result;
    if (result === "Login successful!") {
      loginMsgEl.classList.remove("text-danger");
      setTimeout(() => {
        location.href = "index.html";
      }, 500);
    } else {
      loginMsgEl.classList.add("text-danger");
    }
  };
}

// load index page
if (location.pathname.includes("index.html")) {
  document.addEventListener("DOMContentLoaded", initEventPage);
}

async function initEventPage() {
  const eventContainer = document.getElementById("event-container");
  const myEventContainer = document.getElementById("my-event-container");
  const regEventContainer = document.getElementById("reg-event-container");

  await loadEvents();

  async function loadEvents() {
    const [events, myEvents, regEvents, feedbackEvents] = await Promise.all([
      fetchJSON("assets/php/index.php?action=getEvents"),
      fetchJSON("assets/php/index.php?action=getMyEvents"),
      fetchJSON("assets/php/index.php?action=getRegisteredEvents"),
      fetchJSON("assets/php/index.php?action=getUserFeedbackEvents"),
    ]);

    displayEvents(events);
    displayMyEvents(myEvents);
    displayRegisteredEvents(regEvents, feedbackEvents);
  }

  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err);
      return [];
    }
  }

  function displayEvents(events) {
    renderEventList(eventContainer, events, true);
  }

  function displayMyEvents(events) {
    renderEventList(myEventContainer, events, false);
  }

  function displayRegisteredEvents(events, feedbackEvents) {
    const feedbackEventIds = feedbackEvents.map((event) => event.id);
    renderEventList(regEventContainer, events, false, feedbackEventIds);
  }

  function renderEventList(
    container,
    events,
    allowRegistration,
    feedbackEventIds = []
  ) {
    container.innerHTML = "";
    container.classList.remove("gap-2", "card-container");

    if (events.length === 0) {
      container.innerHTML = `<p class="text-center">${
        allowRegistration
          ? "No events scheduled"
          : container === myEventContainer
          ? "You have not created any event"
          : "You are not registered for any event"
      }</p>`;
      return;
    }

    container.classList.add("gap-2", "card-container");

    events.forEach((event) => {
      const card = document.createElement("div");
      card.className = "card border-0";
      card.innerHTML = `
        <img class="event-img" src="${event.imageURL}" />
        <div class="card-body d-flex flex-column gap-2 justify-content-between">
          <div>
            <h3 class="card-title" title="${event.title}">${event.title}</h3>
            <p class="card-text">${event.date} | ${event.location}</p>
            <p class="card-text event-description">${event.description}</p>
          </div>
          ${
            allowRegistration
              ? `<button class="btn btn-primary" onclick="registerEvent(${event.id})">Register</button>`
              : container === myEventContainer ||
                feedbackEventIds.includes(event.id)
              ? ""
              : `<a href="feedback.html?id=${event.id}" class="btn btn-primary">Give Feedback</a>`
          }
        </div>`;
      container.appendChild(card);
    });
  }

  window.registerEvent = async function (eventId) {
    try {
      const res = await fetch("assets/php/index.php?action=registerEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const result = await res.json();

      if (result.success) {
        alert("Registered successfully!");
        await loadEvents();
      } else {
        alert("Error registering for the event.");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Network error during registration.");
    }
  };
}

// create event
if (location.pathname.includes("createEvent.html")) {
  document
    .getElementById("event-form")
    ?.addEventListener("submit", handleEventSubmit);

  function handleEventSubmit(e) {
    e.preventDefault();

    const formFields = ["title", "date", "location", "description", "imageURL"];
    const formData = getFormData(formFields);

    if (Object.values(formData).some((value) => !value)) {
      alert("All fields are required!");
      return;
    }

    createEvent(formData);
  }

  function getFormData(fields) {
    return fields.reduce((data, field) => {
      data[field] = document.getElementById(field)?.value.trim() || "";
      return data;
    }, {});
  }

  function createEvent(data) {
    fetch("assets/php/index.php?action=createEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          alert("Event created successfully!");
          window.location.href = "index.html";
        } else {
          alert("Error creating event.");
        }
      })
      .catch((err) => {
        console.error("Network error:", err);
        alert("Network error while creating event.");
      });
  }
}

// give feedback for event
if (location.pathname.includes("feedback.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    const feedbackForm = document.getElementById("feedback-form");
    const ratingContainer = document.querySelector(".rating-container");
    const eventId = new URLSearchParams(window.location.search).get("id");
    let selectedRating = 0;

    feedbackForm?.addEventListener("submit", handleSubmit);
    window.updateRating = updateRating;

    function updateRating(value) {
      selectedRating = value;
      [...ratingContainer.children].forEach((star, index) => {
        star.classList.toggle("checked", index < value);
      });
    }

    async function handleSubmit(event) {
      event.preventDefault();

      const formData = new FormData(feedbackForm);
      const comment = formData.get("comment")?.trim();

      if (!comment || !selectedRating) {
        alert("Please fill in all fields and select a rating.");
        return;
      }

      try {
        const response = await fetch(
          "assets/php/index.php?action=submitFeedback",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId,
              comment,
              rating: selectedRating,
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          alert("Thanks for your feedback!");
          window.location.href = "index.html";
        } else {
          alert("Failed to submit feedback. Please try again.");
        }
      } catch (error) {
        console.error("Submission error:", error);
        alert("Network error while submitting feedback.");
      }
    }
  });
}

// show feedbacks on user created events
if (location.pathname.includes("feedbacks.html")) {
  document.addEventListener("DOMContentLoaded", function () {
    const feedbackContainer = document.getElementById("feedback-container");

    function displayFeedbacks(feedbacks) {
      feedbackContainer.innerHTML = "";
      feedbackContainer.classList.remove("gap-2", "card-container");

      if (feedbacks.length === 0) {
        feedbackContainer.innerHTML = `<p class="text-center mt-4">No Feedbacks provided yet</p>`;
        return;
      }

      feedbackContainer.classList.add("gap-2", "card-container");
      feedbacks.forEach((feedback) => {
        const feedbackCard = document.createElement("div");
        feedbackCard.className = "card";
        feedbackCard.innerHTML = `
            <div class="card-body d-flex flex-column">
                <h3 class="card-title" title="${feedback.name}">${feedback.name}</h3>
                <p class="card-text mb-1"><strong>Event: </strong>${feedback.title}</p>
                <p class="card-text mb-1"><strong>Rating: </strong> 
                  <span class="rating-container-${feedback.id}-${feedback.eventId}">
                    <span class="fa fa-star"></span>
                    <span class="fa fa-star"></span>
                    <span class="fa fa-star"></span>
                    <span class="fa fa-star"></span>
                    <span class="fa fa-star"></span>
                  </span>
                </p>
                <p class="card-text"><strong>Comment: </strong>${feedback.comment}</p>
            </div>
        `;
        feedbackContainer.appendChild(feedbackCard);

        // Add star rating
        const ratingContainer = document.querySelector(
          `.rating-container-${feedback.id}-${feedback.eventId}`
        );
        Array.from(ratingContainer.children)
          .slice(0, feedback.rating)
          .forEach((el) => el.classList.add("checked"));
      });
    }

    // Fetch feedbacks
    fetch("assets/php/index.php?action=getFeedbacks")
      .then((response) => response.json())
      .then((data) => {
        displayFeedbacks(data);
      })
      .catch((error) => {
        console.error("Error fetching feedbacks:", error);
        feedbackContainer.innerHTML = `<p class="text-danger text-center mt-4">Failed to load feedbacks</p>`;
      });
  });
}
