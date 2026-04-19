import { InteractiveHomepage } from "@/app/components/home/interactive-homepage";
import {
  buildConstellationNodes,
  buildHomepageEntries
} from "@/lib/archive/homepage";
import { listPublishedEssays } from "@/lib/archive/store";

export default async function HomePage() {
  const essays = await listPublishedEssays(14);
  const entries = buildHomepageEntries(essays);
  const constellationNodes = buildConstellationNodes(entries);

  return (
    <InteractiveHomepage
      entries={entries}
      constellationNodes={constellationNodes}
    />
  );
}
