"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main><section className="ui-empty"><h1>We couldn’t load this workspace.</h1><p>Your data was not changed. Try again, and contact support if the problem continues.</p><button className="ui-button ui-button-primary" type="button" onClick={() => reset()}>Try again</button></section></main>;
}
