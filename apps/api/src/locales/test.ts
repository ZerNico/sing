import i18next from "i18next";

await i18next.init({
  lng: "en",
  debug: true,
  resources: {
    en: {
      translation: {
        key: "hello world",
      },
    },
  },
});
