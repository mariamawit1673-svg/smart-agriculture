import SelectField from "../components/SelectField";
import { soilOptions } from "../constants";

function ProfilePage({ profile, onProfileChange, onSubmit }) {
  return (
    <section className="panel">
      <h2>Farmer Profile</h2>
      <form onSubmit={onSubmit} className="form-grid">
        <label>
          Location
          <input value={profile.location} onChange={(event) => onProfileChange({ ...profile, location: event.target.value })} />
        </label>
        <label>
          Farm size
          <input value={profile.farmSize} onChange={(event) => onProfileChange({ ...profile, farmSize: event.target.value })} placeholder="Example: 2 hectares" />
        </label>
        <SelectField label="Soil type" value={profile.soilType} onChange={(value) => onProfileChange({ ...profile, soilType: value })} options={soilOptions} />
        <label>
          Preferred crops
          <input value={profile.preferredCrops} onChange={(event) => onProfileChange({ ...profile, preferredCrops: event.target.value })} />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={profile.irrigationAvailable} onChange={(event) => onProfileChange({ ...profile, irrigationAvailable: event.target.checked })} />
          Irrigation available
        </label>
        <button type="submit">Save Profile</button>
      </form>
    </section>
  );
}

export default ProfilePage;
