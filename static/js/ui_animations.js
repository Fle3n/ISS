const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function clearFoldBodyStyles(body) {
  body.style.height = "";
  body.style.opacity = "";
  body.style.overflow = "";
}

function animateDetailsOpen(details, body) {
  details.open = true;
  body.style.overflow = "hidden";
  body.style.height = "0px";
  body.style.opacity = "0";

  const targetHeight = `${body.scrollHeight}px`;
  const animation = body.animate(
    [
      { height: "0px", opacity: 0, transform: "translateY(-8px)" },
      { height: targetHeight, opacity: 1, transform: "translateY(0)" },
    ],
    {
      duration: 360,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    },
  );

  animation.onfinish = () => {
    clearFoldBodyStyles(body);
    delete details.dataset.animating;
  };
  animation.oncancel = () => {
    clearFoldBodyStyles(body);
    delete details.dataset.animating;
  };
}

function animateDetailsClose(details, body) {
  body.style.overflow = "hidden";
  body.style.height = `${body.offsetHeight}px`;
  body.style.opacity = "1";

  const animation = body.animate(
    [
      { height: `${body.offsetHeight}px`, opacity: 1, transform: "translateY(0)" },
      { height: "0px", opacity: 0, transform: "translateY(-8px)" },
    ],
    {
      duration: 280,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards",
    },
  );

  animation.onfinish = () => {
    details.open = false;
    clearFoldBodyStyles(body);
    delete details.dataset.animating;
  };
  animation.oncancel = () => {
    clearFoldBodyStyles(body);
    delete details.dataset.animating;
  };
}

function bindAnimatedDetails(details) {
  const summary = details.querySelector(":scope > summary");
  const body = details.querySelector(":scope > .fold-body");

  if (!summary || !body) {
    return;
  }

  summary.addEventListener("click", (event) => {
    event.preventDefault();

    if (details.dataset.animating === "true") {
      return;
    }

    if (reduceMotion.matches) {
      details.open = !details.open;
      return;
    }

    details.dataset.animating = "true";
    if (details.open) {
      animateDetailsClose(details, body);
    } else {
      animateDetailsOpen(details, body);
    }
  });
}

document
  .querySelectorAll("details.fold-card, details.control-fold, details.mission-fold")
  .forEach(bindAnimatedDetails);
