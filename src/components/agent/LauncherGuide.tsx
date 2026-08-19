import type { ReactNode } from "react";
import { ChevronUp } from "lucide-react";

import { Button, Card } from "@/components/ui";
import { launcherFilename } from "@/data/agent";

/** A command the reader types verbatim. */
const Code = ({ children }: { children: ReactNode }) => (
  <code className="scrollbar-slim-light mt-1.5 block w-fit max-w-full overflow-x-auto rounded-md border border-field bg-canvas px-2.5 py-1.5 font-mono text-[12px] whitespace-nowrap text-heading">
    {children}
  </code>
);

/** A file or control named in the step. */
const Ref = ({ children }: { children: ReactNode }) => (
  <span className="font-semibold text-heading">{children}</span>
);

interface GuideCard {
  id: string;
  title: string;
  /** File extensions the platform's launcher comes as. */
  badge: string;
  steps: ReactNode[];
  /** Italic aside under the steps. */
  note?: string;
}

/*
 * Filenames come from `launcherFilename` rather than being typed out, so a
 * command in the guide can never name a file the download does not produce.
 */
const CARDS: GuideCard[] = [
  {
    id: "windows",
    title: "1. Windows Setup",
    badge: ".vbs",
    steps: [
      <>
        Download <Ref>Windows VBS (.vbs)</Ref> above.
      </>,
      <>
        Open your <Ref>Downloads</Ref> folder and double-click the file.
      </>,
      <>Runs silently in the background and reports audit data to portal.</>,
    ],
  },
  {
    id: "macos",
    title: "2. macOS Setup",
    badge: ".command",
    steps: [
      <>
        Download <Ref>macOS Launcher (.command)</Ref> above.
      </>,
      <>
        Grant execution permission in Terminal:
        <Code>chmod +x {launcherFilename("macos")}</Code>
      </>,
      <>
        Execute launcher in Terminal:
        <Code>./{launcherFilename("macos")}</Code>
      </>,
    ],
    note: "Finder mode: Right-click file → Open.",
  },
  {
    id: "linux",
    title: "3. Linux Setup",
    badge: ".sh",
    steps: [
      <>
        Execute launcher in Terminal:
        <Code>./{launcherFilename("linux")}</Code>
      </>,
    ],
  },
];

interface LauncherGuideProps {
  onHide: () => void;
}

/**
 * The "How to Run Launcher Files" panel, opened by the header's User Guide
 * button. It sits directly under the launcher pills because every card
 * starts by pointing at them — "above" has to mean something.
 */
export const LauncherGuide = ({ onHide }: LauncherGuideProps) => (
  <Card className="border-t-[3px] border-t-auth-panel px-5 py-5">
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h2 className="text-base font-bold text-heading">
          How to Run Launcher Files
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          Follow these simple steps to run downloaded launchers across all OS
          types
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        leftIcon={<ChevronUp className="h-4 w-4" strokeWidth={2.2} />}
        onClick={onHide}
      >
        Hide Guide
      </Button>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
      {CARDS.map((card) => (
        <section
          key={card.id}
          className="flex flex-col rounded-xl border border-line bg-canvas px-4 py-4"
        >
          <header className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-heading">{card.title}</h3>
            <span className="shrink-0 rounded-md border border-line bg-surface px-2 py-1 font-mono text-[11px] font-semibold text-muted">
              {card.badge}
            </span>
          </header>

          <ol className="mt-3.5 ml-4 list-decimal space-y-2.5 text-[13px] leading-relaxed text-muted marker:font-semibold marker:text-navy-300">
            {card.steps.map((step, index) => (
              <li key={index} className="pl-0.5">
                {step}
              </li>
            ))}
          </ol>

          {card.note && (
            <p className="mt-auto pt-3.5 text-[12px] text-muted italic">
              {card.note}
            </p>
          )}
        </section>
      ))}
    </div>
  </Card>
);
