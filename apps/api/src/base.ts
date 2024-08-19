import { RouteBuilder } from "@nokijs/server";
import lib from "i18next";
import * as v from "valibot";
import { authService } from "./services/auth";
import { db } from "./services/db";

const instance = lib.createInstance({
  lng: "en",
  fallbackLng: "en",

  
  resources: {
    en: {
      translation: {
        hello: "Hello",
        world: "World",
      },
    },
  },
});

export const baseRoute = new RouteBuilder()
  .derive(() => {
    return {
      test: 123
    }
  })
  .derive(() => {
    return {
      db,
      authService,
    };
  })
  .error((error, { res }) => {
    if (error instanceof v.ValiError) {
      const flattened = v.flatten(error.issues);

      return res.json(
        {
          type: "validation",
          error: flattened,
        },
        {
          status: 400,
        },
      );
    }

    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    return res.json({
      type: "error",
      error: errorMessage,
    });
  })
  .derive(async ({ getCookie, headers }) => {
    if (!instance.isInitialized) {
      await instance.init();
    }

    console.log("123123");
    

    const i18n = instance.cloneInstance();

    const locale = getLocale(getCookie("locale"), headers);
    i18n.changeLanguage(locale);

    return {
      i18n,
      t: i18n.t
    };
  });

function getLocale(langCookie: undefined | string, headers: Record<string, string>) {
  if (langCookie) {
    return langCookie;
  }

  const acceptLanguage = headers["accept-language"];
  

  if (acceptLanguage) {
    return acceptLanguage.split(",")[0];
  }

  return "en";
}
