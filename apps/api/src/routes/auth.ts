import { Hono } from "hono";

export const authApp = new Hono().get('/', (c) => c.text('Hello Hono!'))