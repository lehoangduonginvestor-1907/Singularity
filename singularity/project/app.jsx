/* App — mount canvas with artboards */

const App = () => (
  <DesignCanvas title="Project Singularity · Redesign" subtitle="Global astrophysics forecast engine">
    <DCSection id="ds" title="01 · Foundations">
      <DCArtboard id="design-system" label="Design System · v1.0" width={1480} height={1380}>
        <DesignSystemArtboard/>
      </DCArtboard>
    </DCSection>

    <DCSection id="entry" title="02 · Entry point">
      <DCArtboard id="hero" label="Hero · Site Lock" width={1440} height={900}>
        <HeroArtboard/>
      </DCArtboard>
    </DCSection>

    <DCSection id="dash" title="03 · Dashboard · primary">
      <DCArtboard id="dashboard" label="Tonight's forecast" width={1440} height={1320}>
        <DashboardArtboard/>
      </DCArtboard>
    </DCSection>

    <DCSection id="ops" title="04 · Operator surfaces">
      <DCArtboard id="planner" label="Site Planner · ranked map" width={1440} height={1100}>
        <SitePlannerArtboard/>
      </DCArtboard>
      <DCArtboard id="target" label="Target Explorer" width={1440} height={1280}>
        <TargetArtboard/>
      </DCArtboard>
      <DCArtboard id="hourly" label="Hourly Forecast Table" width={1440} height={1280}>
        <HourlyArtboard/>
      </DCArtboard>
      <DCArtboard id="gear" label="Gear Check & Resolution Limits" width={1440} height={1400}>
        <GearArtboard/>
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
