/* Canvas mount — Hybrid first, then originals for reference */

const LocApp = () => (
  <DesignCanvas
    title="Singularity · Location Entry"
    subtitle="Hybrid recommended · originals kept for reference">

    <DCSection id="hybrid" title="00 · Recommended — Hybrid (C visuals + A UX)">
      <DCArtboard id="loc-hybrid" label="Hybrid · refined" width={1440} height={1280}>
        <LocHybrid/>
      </DCArtboard>
    </DCSection>

    <DCSection id="loc" title="Reference · earlier directions">
      <DCArtboard id="loc-a" label="A · Observatory Console" width={1440} height={1080}>
        <LocA/>
      </DCArtboard>
      <DCArtboard id="loc-b" label="B · Mission Control" width={1440} height={1080}>
        <LocB/>
      </DCArtboard>
      <DCArtboard id="loc-c" label="C · Cinematic" width={1440} height={1080}>
        <LocC/>
      </DCArtboard>
    </DCSection>

  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById("root")).render(<LocApp/>);
