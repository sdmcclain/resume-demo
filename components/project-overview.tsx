//import NextLink from "next/link";
export const ProjectOverview = () => {
  return (
    <div className="flex flex-col items-center justify-end">
      <h1 className="text-3xl font-semibold mb-4">
        Resume <span className="text-zinc-500">+</span> AI Chatbot
      </h1>
      <p className="text-center">Start a chat to analyze candidate resumes.</p>
    </div>
  );
};

//const Link = ({
//  children,
//  href,
//}: {
//  children: React.ReactNode;
//  href: string;
//}) => {
//  return (
//    <NextLink
//      target="_blank"
//      className="text-blue-500 hover:text-blue-600 transition-colors duration-75"
//      href={href}
//    >
//      {children}
//    </NextLink>
//  );
//};
