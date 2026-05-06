import SelectField from "../components/SelectField";
import { rainfallOptions, temperatureOptions, waterOptions } from "../constants";

function AdminPage({
  isAdmin,
  crops,
  cropForm,
  onCropFormChange,
  onAddCrop,
  onDeleteCrop,
}) {
  return (
    <section className="panel">
      <h2>Crop Management</h2>
      {!isAdmin && <p className="muted">Register or login as admin to manage crop records.</p>}
      <form onSubmit={onAddCrop} className="form-grid">
        <label>
          Crop name
          <input value={cropForm.name} onChange={(event) => onCropFormChange({ ...cropForm, name: event.target.value })} required disabled={!isAdmin} />
        </label>
        <label>
          Soil types
          <input value={cropForm.soilTypes} onChange={(event) => onCropFormChange({ ...cropForm, soilTypes: event.target.value })} disabled={!isAdmin} />
        </label>
        <label>
          Seasons
          <input value={cropForm.seasons} onChange={(event) => onCropFormChange({ ...cropForm, seasons: event.target.value })} disabled={!isAdmin} />
        </label>
        <SelectField label="Rainfall" value={cropForm.rainfall} onChange={(value) => onCropFormChange({ ...cropForm, rainfall: value })} options={rainfallOptions} disabled={!isAdmin} />
        <SelectField label="Temperature" value={cropForm.temperature} onChange={(value) => onCropFormChange({ ...cropForm, temperature: value })} options={temperatureOptions} disabled={!isAdmin} />
        <SelectField label="Water requirement" value={cropForm.waterRequirement} onChange={(value) => onCropFormChange({ ...cropForm, waterRequirement: value })} options={waterOptions} disabled={!isAdmin} />
        <label>
          Harvest period
          <input value={cropForm.harvestPeriod} onChange={(event) => onCropFormChange({ ...cropForm, harvestPeriod: event.target.value })} disabled={!isAdmin} />
        </label>
        <label>
          Description
          <textarea value={cropForm.description} onChange={(event) => onCropFormChange({ ...cropForm, description: event.target.value })} disabled={!isAdmin} />
        </label>
        <label>
          Fertilizer advice
          <textarea value={cropForm.fertilizerAdvice} onChange={(event) => onCropFormChange({ ...cropForm, fertilizerAdvice: event.target.value })} disabled={!isAdmin} />
        </label>
        <label>
          Pest advice
          <textarea value={cropForm.pestAdvice} onChange={(event) => onCropFormChange({ ...cropForm, pestAdvice: event.target.value })} disabled={!isAdmin} />
        </label>
        <button type="submit" disabled={!isAdmin}>Add Crop</button>
      </form>

      <div className="list-grid">
        {crops.map((crop) => (
          <article className="record" key={crop._id}>
            <strong>{crop.name}</strong>
            <p>{crop.soilTypes?.join(", ")} soil | {crop.seasons?.join(", ")} season</p>
            {isAdmin && <button className="danger" onClick={() => onDeleteCrop(crop._id)}>Delete</button>}
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminPage;
