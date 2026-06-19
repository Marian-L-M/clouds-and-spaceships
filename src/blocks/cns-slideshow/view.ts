import Glide from "@glidejs/glide";

document
  .querySelectorAll<HTMLElement>(".cns-slideshow__wrapper .glide")
  .forEach((el) => {
    new Glide(el).mount();
  });
