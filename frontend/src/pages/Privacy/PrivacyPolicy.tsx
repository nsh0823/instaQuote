const terms = [
  "The data you enter may be saved in a publicly accessible Google Sheets document.",
  'The service is provided "as is" without warranties of any kind.',
  "We are not responsible for any misuse of the stored data by third parties.",
  "We reserve the right to modify or discontinue the service at any time without notice.",
];

export default function PrivacyPolicy(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#fcfcfd] pl-15 text-[#3d3d43]">
      <main className="mx-auto max-w-225 px-6 pb-10 pt-20 sm:px-10">
        <header className="mb-10 border-b border-black/10 pb-6">
          <h1 className="text-[28px] font-semibold leading-tight text-[#333]">
            Privacy Policy &amp; Terms of Service
          </h1>
          <p className="mt-3 text-[#5b5b61] text-sm/6">
            Welcome! Below you can find our Privacy Policy and Terms of Service.
          </p>
        </header>

        <div className="space-y-10 text-[15px]/7">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#333]">
              Privacy Policy
            </h2>
            <div className="space-y-4">
              <p>
                Our website does not collect any personal data from users. If
                any data is entered and submitted through the application, it
                will be stored in a Google Sheets document. This document is
                accessible to anyone who has the link, but it will not contain
                any personal Google account data.
              </p>
              <p>
                We do not use cookies, tracking technologies, or third-party
                analytics. Your use of this service is completely anonymous,
                except for the data that you choose to submit.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#333]">
              Terms of Service
            </h2>
            <p className="mb-3">
              By using this service, you acknowledge and agree to the following
              terms:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              {terms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#333]">
              Managing Access to Your Google Account
            </h2>
            <p>
              You can review and manage the permissions you&apos;ve granted to
              our app by visiting your{" "}
              <a
                className="text-[#1a73e8] no-underline hover:underline"
                href="https://myaccount.google.com/permissions"
                rel="noreferrer"
                target="_blank"
              >
                Google Account settings
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#333]">
              How Google Helps Users Share Data Safely
            </h2>
            <p>
              Google provides various security measures to help users share
              their data safely. Learn more{" "}
              <a
                className="text-[#1a73e8] no-underline hover:underline"
                href="https://support.google.com/accounts/answer/3466521"
                rel="noreferrer"
                target="_blank"
              >
                here
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
