import {
  Form,
  NavLink,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useLoaderData,
  useNavigation,
  redirect,
  useSubmit,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import appStyleHref from "./app.css?url";
import { getContacts, createEmptyContact } from "./data";
import { useState } from "react";
// import { useEffect, useState } from "react";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: appStyleHref,
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q };
};

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  // the query now needs to be kept in state
  const [prevQ, setPrevQ] = useState(q);
  const [query, setQuery] = useState(q || "");

  // console.log("query", query);

  // We can avoid using `useEffect` to synchronize the query
  // by using a separate piece of state to store the previous
  // value
  if (q !== prevQ) {
    setPrevQ(q);
    setQuery(q || "");
  }

  // useEffect(() => {
  //   const searchField = document.getElementById("q");
  //   if (searchField instanceof HTMLInputElement) {
  //     searchField.value = q || "";
  //   }
  // }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div
          id="sidebar"
          className={navigation.state === "loading" ? "loading" : ""}
        >
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id="search-form"
              role="search"
              onChange={(e) => submit(e.currentTarget)}
            >
              <input
                id="q"
                className={searching ? "loading" : ""}
                aria-label="Search contacts"
                placeholder="Search"
                defaultValue={q || ""}
                type="search"
                name="q"
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No name</i>
                      )}{" "}
                      {contact.favorite ? <span>*</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div id="detail">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
