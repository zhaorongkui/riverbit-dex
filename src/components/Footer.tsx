import clsx from "clsx";

const Footer = () => {
  const shareLinks = [
    {
      label: "Twitter",
      icon: "/icons/footer/twitter.svg",
      hoverIcon: "/icons/footer/twitter-hover.svg",
      url: "",
    },
    {
      label: "Discord",
      icon: "/icons/footer/discord.svg",
      hoverIcon: "/icons/footer/discord-hover.svg",
      url: "",
    },
    {
      label: "Telegram",
      icon: "/icons/footer/tg.svg",
      hoverIcon: "/icons/footer/tg-hover.svg",
      url: "",
    },
    {
      label: "Github",
      icon: "/icons/footer/github.svg",
      hoverIcon: "/icons/footer/github-hover.svg",
      url: "",
    },
  ];

  const footerLinks = [
    {
      label: "Support@riverbit.io",
      url: "",
    },
    {
      label: "Terms of Service",
      url: "",
    },
    {
      label: "Privacy Policy",
      url: "",
    },
  ];

  return (
    <div className={clsx("footer  bg-Dark_Tier1 py-6 px-4")}>
      <section
        className={clsx(
          "md:max-w-[1200px] 3xl:max-w-[1500px] mx-auto grid gap-6",
          "md:max-w-[1200px]",
          "3xl:max-w-[1500px]"
        )}
      >
        <div className="flex items-center justify-between">
          <img
            className={clsx("h-5 w-auto", "md:h-10")}
            src="/footer-Riverbit.svg"
            alt=""
          />
          <p className={clsx("flex items-center gap-2", "md:gap-6")}>
            {shareLinks.map((item) => (
              <img
                key={item.label}
                className={clsx("w-6 h-6 cursor-pointer")}
                onMouseOver={(e) => (e.currentTarget.src = item.hoverIcon)}
                onMouseOut={(e) => (e.currentTarget.src = item.icon)}
                src={item.icon}
                alt={item.label}
              />
            ))}
          </p>
        </div>
        <div className="w-full border-t border-Dark_Tier4"></div>
        <div
          className={clsx(
            "flex flex-col items-center justify-between text-Dark_Tier4 text-xs text-center",
            "md:flex-row md:text-sm"
          )}
        >
          <p>© 2025 Riverbit Inc. All rights reserved.</p>
          <p
            className={clsx(
              "mt-2 flex justify-center items-center gap-2",
              "md:mt-0"
            )}
          >
            {footerLinks.map((item, index) => (
              <a
                key={item.label}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  "px-2",
                  index === 1 && "border-x border-Dark_Tier4"
                )}
              >
                {item.label}
              </a>
            ))}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Footer;
