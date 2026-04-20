"use client";

import React, { useState } from "react";
import {
  GripVertical,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Upload,
  Download,
  Settings,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Move,
  PlusCircle,
  Image as ImageIcon,
  Sliders,
  Play,
  Replace,
  Clipboard,
  ClipboardCheck,
} from "lucide-react";

const getAssetUrl = (entityId) =>
  entityId ? `https://assets.eko.com/video/${entityId}/0` : null;

const deepClone = (value) =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const DEFAULT_GALLERY_SETTINGS = {
  showPBE: false,
  navigation: { showBackButton: false },
  textColor: "Primary",
  backgroundColor: "Secondary",
  layout: { buttonsContainerHeight: 57, navButtonsLocation: "nav" },
};

const GalleryEditor = () => {
  const [galleryData, setGalleryData] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonInput, setShowJsonInput] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedModule, setDraggedModule] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverModule, setDragOverModule] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showJsonOutput, setShowJsonOutput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draggedAssetId, setDraggedAssetId] = useState(null);
  const [assetDropTarget, setAssetDropTarget] = useState(null);
  const [copyStatus, setCopyStatus] = useState("idle");
  const [importError, setImportError] = useState(null);

  const sampleData = {
    items: [
      {
        id: "81329c7e-e34a-4788-8f5a-15e5990e510b",
        itemType: "galleryItemV2",
        name: "See product",
        modules: [
          {
            itemType: "videoModule",
            video: {
              entity: {
                entityType: "assets",
                entityId: "54398910-3c90-11f1-bef8-a749ed39e5eb",
              },
              assetType: "video",
            },
            loop: true,
            textBox: { textColor: "#000000", bgColor: "#F6F6F6" },
          },
        ],
        icon: {
          assetType: "image",
          entity: {
            entityType: "assets",
            entityId: "a76c7090-59e5-11f0-9748-a3a287e390c5",
          },
        },
      },
      {
        id: "7327c379-fe14-4cf1-afd1-bae0c8c78045",
        itemType: "galleryItemV2",
        name: "Features",
        modules: [
          {
            itemType: "videoModule",
            video: {
              entity: {
                entityType: "assets",
                entityId: "1e900c30-3c90-11f1-908b-d177698e7746",
              },
              assetType: "video",
            },
            loop: true,
            textBox: {
              textColor: "#000000",
              bgColor: "#F6F6F6",
              description: "Ultra-lightweight 5g open-ear clip design.",
            },
          },
        ],
        icon: {
          assetType: "image",
          entity: {
            entityType: "assets",
            entityId: "a76c4981-59e5-11f0-9748-a3a287e390c5",
          },
        },
      },
    ],
    showPBE: false,
    navigation: { showBackButton: false },
    textColor: "Primary",
    backgroundColor: "Secondary",
    layout: { buttonsContainerHeight: 57, navButtonsLocation: "nav" },
  };

  const generateId = () => {
    return "xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/[x]/g, () => {
      return ((Math.random() * 16) | 0).toString(16);
    });
  };

  const handleJsonLoad = () => {
    if (!jsonInput.trim()) {
      setImportError("Please paste some JSON first.");
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(jsonInput);
    } catch (e) {
      setImportError(
        `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`
      );
      return;
    }
    if (!parsed || typeof parsed !== "object") {
      setImportError("JSON must be an object with an `items` array.");
      return;
    }
    if (!Array.isArray(parsed.items)) {
      setImportError(
        "Missing `items` array. Expected shape: { items: [...], ... }."
      );
      return;
    }
    const itemsWithIds = parsed.items.map((item) => ({
      ...item,
      id: item?.id || generateId(),
    }));
    setGalleryData({
      ...parsed,
      items: itemsWithIds,
    });
    setImportError(null);
    setShowJsonInput(false);
  };

  const handleSampleLoad = () => {
    setGalleryData(deepClone(sampleData));
    setImportError(null);
    setShowJsonInput(false);
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const updateItem = (itemIndex, updater) => {
    setGalleryData((prev) => {
      if (!prev?.items?.[itemIndex]) return prev;
      const newItems = [...prev.items];
      newItems[itemIndex] =
        typeof updater === "function" ? updater(newItems[itemIndex]) : updater;
      return { ...prev, items: newItems };
    });
  };

  const handleItemDragStart = (e, item, index) => {
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleItemDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleItemDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleItemDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedItem && draggedItem.index !== dropIndex && galleryData?.items) {
      const newItems = [...galleryData.items];
      const [movedItem] = newItems.splice(draggedItem.index, 1);
      newItems.splice(dropIndex, 0, movedItem);

      setGalleryData({ ...galleryData, items: newItems });
    }

    setDraggedItem(null);
  };

  const handleModuleDragStart = (e, module, itemIndex, moduleIndex) => {
    setDraggedModule({ module, itemIndex, moduleIndex });
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };

  const handleModuleDragOver = (e, targetItemIndex, targetModuleIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverModule({
      itemIndex: targetItemIndex,
      moduleIndex: targetModuleIndex,
    });
  };

  const handleModuleDragLeave = () => {
    setDragOverModule(null);
  };

  const handleModuleDrop = (e, targetItemIndex, targetModuleIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverModule(null);

    if (draggedModule && galleryData?.items) {
      const newItems = [...galleryData.items];
      const sourceItem = newItems[draggedModule.itemIndex];
      const targetItem = newItems[targetItemIndex];

      if (sourceItem && targetItem) {
        const [movedModule] = sourceItem.modules.splice(
          draggedModule.moduleIndex,
          1
        );
        targetItem.modules.splice(targetModuleIndex, 0, movedModule);

        setGalleryData({ ...galleryData, items: newItems });
      }
    }

    setDraggedModule(null);
  };

  const handleAssetCopyDragStart = (e, entityId) => {
    e.stopPropagation();
    setDraggedAssetId(entityId);
    try {
      e.dataTransfer.setData("text/plain", entityId);
    } catch {}
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleAssetCopyDragEnd = () => {
    setDraggedAssetId(null);
    setAssetDropTarget(null);
  };

  const applyAssetCopy = (targetItemIndex, targetModuleIndex) => {
    if (draggedAssetId == null) return;
    const newItems = [...(galleryData?.items || [])];
    const targetModule =
      newItems[targetItemIndex]?.modules?.[targetModuleIndex];
    if (targetModule) {
      targetModule.video = {
        ...(targetModule.video || {}),
        entity: {
          entityType: targetModule.video?.entity?.entityType || "assets",
          entityId: draggedAssetId,
        },
        assetType: targetModule.video?.assetType || "video",
      };
      setGalleryData({ ...galleryData, items: newItems });
    }
    setDraggedAssetId(null);
    setAssetDropTarget(null);
  };

  const handleModuleDropOnItem = (e, targetItemIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverModule(null);

    if (draggedModule && galleryData?.items) {
      const newItems = [...galleryData.items];
      const sourceItem = newItems[draggedModule.itemIndex];
      const targetItem = newItems[targetItemIndex];

      if (sourceItem && targetItem) {
        const [movedModule] = sourceItem.modules.splice(
          draggedModule.moduleIndex,
          1
        );
        if (!Array.isArray(targetItem.modules)) targetItem.modules = [];
        targetItem.modules.push(movedModule);

        setGalleryData({ ...galleryData, items: newItems });
      }
    }

    setDraggedModule(null);
  };

  const moveItem = (fromIndex, toIndex) => {
    if (!galleryData?.items) return;

    const newItems = [...galleryData.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    setGalleryData({ ...galleryData, items: newItems });
  };

  const handleDeleteItem = (itemId) => {
    setConfirmDelete({
      type: "item",
      id: itemId,
      message: "Are you sure you want to delete this item?",
    });
  };

  const confirmDeleteAction = () => {
    if (confirmDelete.type === "item") {
      const newItems = (galleryData?.items || []).filter(
        (item) => item.id !== confirmDelete.id
      );
      setGalleryData({ ...galleryData, items: newItems });
    } else if (confirmDelete.type === "module") {
      const newItems = [...(galleryData?.items || [])];
      if (newItems[confirmDelete.itemIndex]) {
        newItems[confirmDelete.itemIndex].modules.splice(
          confirmDelete.moduleIndex,
          1
        );
      }
      setGalleryData({ ...galleryData, items: newItems });
    }

    setConfirmDelete(null);
  };

  const handleDeleteModule = (itemIndex, moduleIndex) => {
    setConfirmDelete({
      type: "module",
      itemIndex,
      moduleIndex,
      message: "Are you sure you want to delete this module?",
    });
  };

  const handleEditModule = (itemIndex, moduleIndex) => {
    const item = galleryData.items[itemIndex];
    const module = item.modules[moduleIndex];

    setEditingModule({
      module: deepClone(module),
      itemIndex,
      moduleIndex,
      itemName: item.name,
    });
  };

  const handleSaveModuleEdit = () => {
    const newItems = [...galleryData.items];
    newItems[editingModule.itemIndex].modules[editingModule.moduleIndex] =
      editingModule.module;

    setGalleryData({ ...galleryData, items: newItems });
    setEditingModule(null);
  };

  const handleDuplicateItem = (itemId) => {
    const item = galleryData.items.find((i) => i.id === itemId);
    if (!item) return;
    const duplicatedItem = {
      ...deepClone(item),
      id: generateId(),
      name: `${item.name} (Copy)`,
    };

    const itemIndex = galleryData.items.indexOf(item);
    const updatedItems = [...galleryData.items];
    updatedItems.splice(itemIndex + 1, 0, duplicatedItem);

    setGalleryData({ ...galleryData, items: updatedItems });
  };

  const handleDuplicateModule = (itemIndex, moduleIndex) => {
    const newItems = [...galleryData.items];
    const originalModule = newItems[itemIndex].modules[moduleIndex];
    const duplicatedModule = deepClone(originalModule);

    newItems[itemIndex].modules.splice(moduleIndex + 1, 0, duplicatedModule);
    setGalleryData({ ...galleryData, items: newItems });
  };

  const handleAddNewItem = () => {
    const newItem = {
      id: generateId(),
      itemType: "galleryItemV2",
      name: "New Item",
      modules: [createBlankModule()],
      icon: {
        assetType: "image",
        entity: { entityType: "assets", entityId: "" },
      },
    };

    setGalleryData({
      ...galleryData,
      items: [...(galleryData?.items || []), newItem],
    });
  };

  const createBlankModule = () => ({
    itemType: "videoModule",
    video: {
      entity: { entityType: "assets", entityId: "" },
      assetType: "video",
    },
    loop: true,
    textBox: { textColor: "#000000", bgColor: "#F6F6F6" },
  });

  const handleAddNewModule = (itemIndex) => {
    const newItems = [...galleryData.items];
    if (!Array.isArray(newItems[itemIndex].modules)) {
      newItems[itemIndex].modules = [];
    }
    newItems[itemIndex].modules.push(createBlankModule());
    setGalleryData({ ...galleryData, items: newItems });
  };

  const handleExportJson = () => {
    setShowJsonOutput(true);
  };

  const handleCopyJson = async () => {
    const json = JSON.stringify(galleryData, null, 2);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(json);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = json;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    setTimeout(() => setCopyStatus("idle"), 1800);
  };

  const getModuleTypeColor = (moduleType) => {
    const colors = {
      videoModule: "bg-blue-100 text-blue-800",
      toggleModule: "bg-green-100 text-green-800",
      modesModule: "bg-purple-100 text-purple-800",
      imageModule: "bg-yellow-100 text-yellow-800",
      tryItModule: "bg-red-100 text-red-800",
      storiesModule: "bg-pink-100 text-pink-800",
    };
    return colors[moduleType] || "bg-gray-100 text-gray-800";
  };

  const shortId = (id, length = 8) => {
    if (!id) return "";
    return id.length > length ? `${id.slice(0, length)}…` : id;
  };

  const getModuleTitle = (module, fallbackIndex) => {
    if (module.textBox?.title) return module.textBox.title;
    if (module.options?.[0]?.textBox?.title)
      return module.options[0].textBox.title;
    if (module.modes?.[0]?.title) return module.modes[0].title;
    return `Module ${fallbackIndex + 1}`;
  };

  const getModuleDescription = (module) => {
    if (module.textBox?.description) return module.textBox.description;
    if (module.options?.[0]?.textBox?.description)
      return module.options[0].textBox.description;
    if (module.modes?.[0]?.description) return module.modes[0].description;
    const entityId = module.video?.entity?.entityId;
    if (entityId) return `asset: ${shortId(entityId, 12)}`;
    return "No description";
  };

  const editItemName = (itemIndex, newName) => {
    updateItem(itemIndex, (item) => ({ ...item, name: newName }));
  };

  const editItemIconId = (itemIndex, newEntityId) => {
    updateItem(itemIndex, (item) => ({
      ...item,
      icon: {
        assetType: item.icon?.assetType || "image",
        entity: {
          entityType: item.icon?.entity?.entityType || "assets",
          entityId: newEntityId,
        },
      },
    }));
  };

  const updateGallerySetting = (patch) => {
    setGalleryData((prev) => ({ ...prev, ...patch }));
  };

  const updateGalleryNested = (key, patch) => {
    setGalleryData((prev) => ({
      ...prev,
      [key]: { ...(prev?.[key] || {}), ...patch },
    }));
  };

  if (showJsonInput) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gallery JSON Editor
          </h1>
          <p className="text-gray-600">
            Import your gallery JSON to start editing with drag &amp; drop
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Import Gallery JSON</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              if (importError) setImportError(null);
            }}
            placeholder="Paste your gallery block JSON here..."
            className={`w-full h-64 p-3 border rounded-md font-mono text-sm resize-none ${
              importError ? "border-red-400" : "border-gray-300"
            }`}
          />
          {importError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              <strong className="font-semibold">Couldn&apos;t load JSON: </strong>
              {importError}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleJsonLoad}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} />
              Load JSON
            </button>
            <button
              onClick={handleSampleLoad}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Eye size={16} />
              Load Sample Data
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Supported fields:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Gallery-level: <code>showPBE</code>, <code>navigation.showBackButton</code>, <code>textColor</code>, <code>backgroundColor</code>, <code>layout.buttonsContainerHeight</code>, <code>layout.navButtonsLocation</code></li>
            <li>• Item-level: <code>name</code>, <code>icon</code> (image asset)</li>
            <li>• Module-level: video <code>entity.entityId</code>, <code>loop</code>, <code>textBox.title / description / textColor / bgColor</code></li>
            <li>• Drag &amp; drop reordering for items and modules</li>
            <li>• Preview mode &amp; JSON export</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gallery JSON Editor
          </h1>
          <p className="text-gray-600">
            {galleryData?.items?.length || 0} items
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              showSettings
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Sliders size={16} />
            Gallery Settings
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {previewMode ? "Edit Mode" : "Preview"}
          </button>
          <button
            onClick={handleAddNewItem}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Add Item
          </button>
          <button
            onClick={handleCopyJson}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors ${
              copyStatus === "copied"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : copyStatus === "error"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title="Copy current JSON to clipboard"
          >
            {copyStatus === "copied" ? (
              <>
                <ClipboardCheck size={16} />
                Copied!
              </>
            ) : copyStatus === "error" ? (
              <>
                <Clipboard size={16} />
                Copy failed
              </>
            ) : (
              <>
                <Clipboard size={16} />
                Copy JSON
              </>
            )}
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            View JSON
          </button>
          <button
            onClick={() => setShowJsonInput(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <Settings size={16} />
            Import New
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sliders size={18} />
            Gallery Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Text Color
              </label>
              <select
                value={galleryData?.textColor ?? DEFAULT_GALLERY_SETTINGS.textColor}
                onChange={(e) =>
                  updateGallerySetting({ textColor: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Background Color
              </label>
              <select
                value={
                  galleryData?.backgroundColor ??
                  DEFAULT_GALLERY_SETTINGS.backgroundColor
                }
                onChange={(e) =>
                  updateGallerySetting({ backgroundColor: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nav Buttons Location
              </label>
              <select
                value={
                  galleryData?.layout?.navButtonsLocation ??
                  DEFAULT_GALLERY_SETTINGS.layout.navButtonsLocation
                }
                onChange={(e) =>
                  updateGalleryNested("layout", {
                    navButtonsLocation: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="nav">nav</option>
                <option value="header">header</option>
                <option value="footer">footer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Buttons Container Height (px)
              </label>
              <input
                type="number"
                value={
                  galleryData?.layout?.buttonsContainerHeight ??
                  DEFAULT_GALLERY_SETTINGS.layout.buttonsContainerHeight
                }
                onChange={(e) =>
                  updateGalleryNested("layout", {
                    buttonsContainerHeight: Number(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={!!galleryData?.showPBE}
                onChange={(e) =>
                  updateGallerySetting({ showPBE: e.target.checked })
                }
              />
              Show PBE
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={!!galleryData?.navigation?.showBackButton}
                onChange={(e) =>
                  updateGalleryNested("navigation", {
                    showBackButton: e.target.checked,
                  })
                }
              />
              Show Back Button
            </label>
          </div>
        </div>
      )}

      {previewMode ? (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Gallery Preview</h2>
          <div className="space-y-4">
            {galleryData?.items?.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 border shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">
                    {index + 1}. {item.name}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {item.modules?.map((module, moduleIndex) => (
                      <span
                        key={moduleIndex}
                        className={`px-2 py-1 rounded text-xs ${getModuleTypeColor(
                          module.itemType
                        )}`}
                      >
                        {module.itemType}
                      </span>
                    ))}
                  </div>
                </div>
                {item.icon?.entity?.entityId && (
                  <div className="text-xs text-gray-500 mb-2 ml-4 flex items-center gap-1">
                    <ImageIcon size={12} />
                    icon: {shortId(item.icon.entity.entityId, 16)}
                  </div>
                )}
                <div className="space-y-2 ml-4">
                  {item.modules?.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="text-sm">
                      <span className="font-medium text-gray-700">
                        {moduleIndex + 1}. {getModuleTitle(module, moduleIndex)}
                      </span>
                      <p className="text-gray-600 text-xs">
                        {getModuleDescription(module)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {galleryData?.items?.map((item, itemIndex) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg border transition-all duration-200 ${
                dragOverIndex === itemIndex ? "border-blue-500 bg-blue-50" : ""
              } ${draggedItem?.index === itemIndex ? "opacity-50" : ""}`}
              onDragOver={(e) => {
                if (draggedModule) {
                  e.preventDefault();
                  e.stopPropagation();
                } else {
                  handleItemDragOver(e, itemIndex);
                }
              }}
              onDragLeave={handleItemDragLeave}
              onDrop={(e) => {
                if (draggedModule) {
                  handleModuleDropOnItem(e, itemIndex);
                } else {
                  handleItemDrop(e, itemIndex);
                }
              }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                      draggable
                      onDragStart={(e) =>
                        handleItemDragStart(e, item, itemIndex)
                      }
                    >
                      <GripVertical size={16} className="text-gray-400" />
                    </div>
                    <button
                      onClick={() => toggleItemExpansion(item.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedItems[item.id] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                        {itemIndex + 1}
                      </span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          editItemName(itemIndex, e.target.value)
                        }
                        className="font-semibold text-lg bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-sm text-gray-500 mr-2 whitespace-nowrap">
                      {item.modules?.length || 0} modules
                    </span>
                    {itemIndex > 0 && (
                      <button
                        onClick={() => moveItem(itemIndex, itemIndex - 1)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Move up"
                      >
                        <ArrowUp size={16} />
                      </button>
                    )}
                    {itemIndex < (galleryData?.items?.length || 0) - 1 && (
                      <button
                        onClick={() => moveItem(itemIndex, itemIndex + 1)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Move down"
                      >
                        <ArrowDown size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleAddNewModule(itemIndex)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Add Module"
                    >
                      <PlusCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleDuplicateItem(item.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 ml-10 flex items-center gap-2">
                  <ImageIcon size={14} className="text-gray-400" />
                  <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                    Icon asset ID
                  </label>
                  <input
                    type="text"
                    value={item.icon?.entity?.entityId || ""}
                    onChange={(e) =>
                      editItemIconId(itemIndex, e.target.value)
                    }
                    placeholder="image asset entityId"
                    className="flex-1 min-w-0 px-2 py-1 text-xs font-mono border border-gray-200 rounded bg-gray-50 focus:bg-white focus:border-blue-400 outline-none"
                  />
                </div>
              </div>

              {expandedItems[item.id] && (
                <div className="border-t bg-gray-50 p-4">
                  <div className="space-y-3">
                    {(item.modules || []).map((module, moduleIndex) => (
                      <div
                        key={moduleIndex}
                        draggable
                        onDragStart={(e) =>
                          handleModuleDragStart(
                            e,
                            module,
                            itemIndex,
                            moduleIndex
                          )
                        }
                        onDragOver={(e) => {
                          if (draggedAssetId != null) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.dropEffect = "copy";
                            setAssetDropTarget({ itemIndex, moduleIndex });
                          } else {
                            handleModuleDragOver(e, itemIndex, moduleIndex);
                          }
                        }}
                        onDragLeave={() => {
                          if (draggedAssetId != null) {
                            setAssetDropTarget(null);
                          } else {
                            handleModuleDragLeave();
                          }
                        }}
                        onDrop={(e) => {
                          if (draggedAssetId != null) {
                            e.preventDefault();
                            e.stopPropagation();
                            applyAssetCopy(itemIndex, moduleIndex);
                          } else {
                            handleModuleDrop(e, itemIndex, moduleIndex);
                          }
                        }}
                        className={`bg-white rounded-lg p-3 border cursor-move hover:shadow-sm transition-all ${
                          assetDropTarget?.itemIndex === itemIndex &&
                          assetDropTarget?.moduleIndex === moduleIndex
                            ? "border-amber-500 bg-amber-50 ring-2 ring-amber-300"
                            : dragOverModule?.itemIndex === itemIndex &&
                              dragOverModule?.moduleIndex === moduleIndex
                            ? "border-blue-500 bg-blue-50"
                            : ""
                        } ${
                          draggedModule?.itemIndex === itemIndex &&
                          draggedModule?.moduleIndex === moduleIndex
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="cursor-grab active:cursor-grabbing">
                              <Move size={14} className="text-gray-400" />
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs whitespace-nowrap ${getModuleTypeColor(
                                module.itemType
                              )}`}
                            >
                              {module.itemType}
                            </span>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">
                                {getModuleTitle(module, moduleIndex)}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {getModuleDescription(module)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {(() => {
                              const assetUrl = getAssetUrl(
                                module.video?.entity?.entityId
                              );
                              return (
                                <a
                                  href={assetUrl || undefined}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!assetUrl) e.preventDefault();
                                  }}
                                  onDragStart={(e) => e.preventDefault()}
                                  draggable={false}
                                  className={`p-1 rounded ${
                                    assetUrl
                                      ? "text-purple-600 hover:bg-purple-50"
                                      : "text-gray-300 cursor-not-allowed"
                                  }`}
                                  title={
                                    assetUrl
                                      ? "Play asset in new tab"
                                      : "No asset ID set"
                                  }
                                  aria-disabled={!assetUrl}
                                >
                                  <Play size={14} />
                                </a>
                              );
                            })()}
                            {(() => {
                              const sourceId = module.video?.entity?.entityId;
                              const hasId = !!sourceId;
                              const isActive = draggedAssetId === sourceId && hasId;
                              return (
                                <span
                                  draggable={hasId}
                                  onDragStart={(e) =>
                                    hasId &&
                                    handleAssetCopyDragStart(e, sourceId)
                                  }
                                  onDragEnd={handleAssetCopyDragEnd}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`p-1 rounded select-none ${
                                    hasId
                                      ? "text-amber-600 hover:bg-amber-50 cursor-grab active:cursor-grabbing"
                                      : "text-gray-300 cursor-not-allowed"
                                  } ${isActive ? "ring-2 ring-amber-400" : ""}`}
                                  title={
                                    hasId
                                      ? "Drag onto another module to copy this asset ID"
                                      : "No asset ID to copy"
                                  }
                                  aria-disabled={!hasId}
                                >
                                  <Replace size={14} />
                                </span>
                              );
                            })()}
                            <button
                              onClick={() =>
                                handleEditModule(itemIndex, moduleIndex)
                              }
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Module"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() =>
                                handleDuplicateModule(itemIndex, moduleIndex)
                              }
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Duplicate Module"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteModule(itemIndex, moduleIndex)
                              }
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete Module"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!item.modules || item.modules.length === 0) && (
                      <p className="text-sm text-gray-500 italic">
                        No modules yet. Click the + button above to add one.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showJsonOutput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Export JSON</h2>
              <button
                onClick={() => setShowJsonOutput(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Select all and copy the JSON below:
            </p>

            <textarea
              readOnly
              value={JSON.stringify(galleryData, null, 2)}
              className="w-full h-96 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
              onClick={(e) => e.target.select()}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCopyJson}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors ${
                  copyStatus === "copied"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : copyStatus === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {copyStatus === "copied" ? (
                  <>
                    <ClipboardCheck size={16} />
                    Copied!
                  </>
                ) : copyStatus === "error" ? (
                  <>
                    <Clipboard size={16} />
                    Copy failed
                  </>
                ) : (
                  <>
                    <Clipboard size={16} />
                    Copy JSON
                  </>
                )}
              </button>
              <button
                onClick={() => setShowJsonOutput(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">{confirmDelete.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editingModule && (
        <ModuleEditor
          editingModule={editingModule}
          setEditingModule={setEditingModule}
          onSave={handleSaveModuleEdit}
          getModuleTypeColor={getModuleTypeColor}
        />
      )}
    </div>
  );
};

const ModuleEditor = ({
  editingModule,
  setEditingModule,
  onSave,
  getModuleTypeColor,
}) => {
  const module = editingModule.module;

  const updateModule = (patch) => {
    setEditingModule({
      ...editingModule,
      module: { ...module, ...patch },
    });
  };

  const updateTextBox = (patch) => {
    setEditingModule({
      ...editingModule,
      module: {
        ...module,
        textBox: { ...(module.textBox || {}), ...patch },
      },
    });
  };

  const updateVideoEntity = (patch) => {
    setEditingModule({
      ...editingModule,
      module: {
        ...module,
        video: {
          ...(module.video || {}),
          entity: {
            entityType: module.video?.entity?.entityType || "assets",
            entityId: module.video?.entity?.entityId || "",
            ...patch,
          },
          assetType: module.video?.assetType || "video",
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Edit Module — {editingModule.itemName}
          </h2>
          <button
            onClick={() => setEditingModule(null)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Module Type</label>
            <span
              className={`px-3 py-1 rounded text-sm ${getModuleTypeColor(
                module.itemType
              )}`}
            >
              {module.itemType}
            </span>
          </div>

          {module.itemType === "videoModule" && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Video</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Asset Entity ID
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={module.video?.entity?.entityId || ""}
                      onChange={(e) =>
                        updateVideoEntity({ entityId: e.target.value })
                      }
                      placeholder="video asset entityId"
                      className="flex-1 min-w-0 p-2 border border-gray-300 rounded-md font-mono text-sm"
                    />
                    {(() => {
                      const assetUrl = getAssetUrl(
                        module.video?.entity?.entityId
                      );
                      return (
                        <a
                          href={assetUrl || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!assetUrl) e.preventDefault();
                          }}
                          className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                            assetUrl
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            assetUrl
                              ? "Play asset in new tab"
                              : "Enter an entity ID to enable"
                          }
                          aria-disabled={!assetUrl}
                        >
                          <Play size={14} />
                          Play
                        </a>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Entity Type
                  </label>
                  <input
                    type="text"
                    value={module.video?.entity?.entityType || "assets"}
                    onChange={(e) =>
                      updateVideoEntity({ entityType: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={!!module.loop}
                  onChange={(e) => updateModule({ loop: e.target.checked })}
                />
                Loop video
              </label>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Text Box</h3>
              {!module.textBox && (
                <button
                  onClick={() =>
                    updateModule({
                      textBox: { textColor: "#000000", bgColor: "#F6F6F6" },
                    })
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add text box
                </button>
              )}
            </div>

            {module.textBox && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={module.textBox.title || ""}
                    onChange={(e) => updateTextBox({ title: e.target.value })}
                    placeholder="(optional)"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={module.textBox.description || ""}
                    onChange={(e) =>
                      updateTextBox({ description: e.target.value })
                    }
                    placeholder="(optional)"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={module.textBox.textColor || "#000000"}
                        onChange={(e) =>
                          updateTextBox({ textColor: e.target.value })
                        }
                        className="h-10 w-14 p-1 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={module.textBox.textColor || ""}
                        onChange={(e) =>
                          updateTextBox({ textColor: e.target.value })
                        }
                        className="flex-1 p-2 border border-gray-300 rounded-md font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={module.textBox.bgColor || "#FFFFFF"}
                        onChange={(e) =>
                          updateTextBox({ bgColor: e.target.value })
                        }
                        className="h-10 w-14 p-1 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={module.textBox.bgColor || ""}
                        onChange={(e) =>
                          updateTextBox({ bgColor: e.target.value })
                        }
                        className="flex-1 p-2 border border-gray-300 rounded-md font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setEditingModule(null)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryEditor;
