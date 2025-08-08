export function SiteFooter() {
  return (
    <footer className="flex items-center justify-center p-4">
      <div className="container flex flex-col items-center justify-center gap-2 md:h-16 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
          Made with{' '}
          <span role="img" aria-label="heart">
            ❤️
          </span>{' '}
          by{' '}
          <a
            href="https://github.com/HrbzxcDev"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            HrbzxcDev
          </a>
        </p>
      </div>
    </footer>
  );
}
