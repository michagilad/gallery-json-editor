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
} from "lucide-react";

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

  const sampleData = {
    items: [
      {
        id: "3acc0eba-fcc1-4f96-bb88-11ed01b7686c",
        itemType: "galleryItemV2",
        name: "Color Overview",
        modules: [
          {
            itemType: "videoModule",
            video: {
              entity: {
                entityId: "sample-video-1",
                entityType: "assets",
              },
              assetType: "video",
            },
            loop: true,
            textBox: {
              textColor: "#000000",
              bgColor: "#F6F6F6",
              title: "Product Overview",
              description: "See our product in all available colors",
            },
          },
        ],
      },
    ],
  };

  const generateId = () => {
    return "xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/[x]/g, () => {
      return ((Math.random() * 16) | 0).toString(16);
    });
  };

  const handleJsonLoad = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.items) {
        const itemsWithIds = parsed.items.map((item) => ({
          ...item,
          id: item.id || generateId(),
        }));
        setGalleryData({
          ...parsed,
          items: itemsWithIds,
        });
        setShowJsonInput(false);
      } else {
        console.error("Invalid gallery JSON format");
      }
    } catch (e) {
      console.error("Invalid JSON format");
    }
  };

  const handleSampleLoad = () => {
    setGalleryData(sampleData);
    setShowJsonInput(false);
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
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

      setGalleryData({
        ...galleryData,
        items: newItems,
      });
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

        setGalleryData({
          ...galleryData,
          items: newItems,
        });
      }
    }

    setDraggedModule(null);
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
        targetItem.modules.push(movedModule);

        setGalleryData({
          ...galleryData,
          items: newItems,
        });
      }
    }

    setDraggedModule(null);
  };

  const moveItem = (fromIndex, toIndex) => {
    if (!galleryData?.items) return;

    const newItems = [...galleryData.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    setGalleryData({
      ...galleryData,
      items: newItems,
    });
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

      setGalleryData({
        ...galleryData,
        items: newItems,
      });
    } else if (confirmDelete.type === "module") {
      const newItems = [...(galleryData?.items || [])];
      if (newItems[confirmDelete.itemIndex]) {
        newItems[confirmDelete.itemIndex].modules.splice(
          confirmDelete.moduleIndex,
          1
        );
      }

      setGalleryData({
        ...galleryData,
        items: newItems,
      });
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
      module: { ...module },
      itemIndex,
      moduleIndex,
      itemName: item.name,
    });
  };

  const handleSaveModuleEdit = () => {
    const newItems = [...galleryData.items];
    newItems[editingModule.itemIndex].modules[editingModule.moduleIndex] =
      editingModule.module;

    setGalleryData({
      ...galleryData,
      items: newItems,
    });
    setEditingModule(null);
  };

  const handleDuplicateItem = (itemId) => {
    const item = galleryData.items.find((i) => i.id === itemId);
    const duplicatedItem = {
      ...item,
      id: generateId(),
      name: `${item.name} (Copy)`,
      modules: item.modules.map((module) => ({ ...module })),
    };

    const itemIndex = galleryData.items.indexOf(item);
    const updatedItems = [...galleryData.items];
    updatedItems.splice(itemIndex + 1, 0, duplicatedItem);

    setGalleryData({
      ...galleryData,
      items: updatedItems,
    });
  };

  const handleDuplicateModule = (itemIndex, moduleIndex) => {
    const newItems = [...galleryData.items];
    const originalModule = newItems[itemIndex].modules[moduleIndex];
    const duplicatedModule = { ...originalModule };

    newItems[itemIndex].modules.splice(moduleIndex + 1, 0, duplicatedModule);

    setGalleryData({
      ...galleryData,
      items: newItems,
    });
  };

  const handleAddNewItem = () => {
    const newItem = {
      id: generateId(),
      itemType: "galleryItemV2",
      name: "New Item",
      modules: [
        {
          itemType: "videoModule",
          video: {
            entity: {
              entityId: "deec26e0-b6bc-11ef-8ba0-63340852c11c",
              entityType: "assets",
            },
            assetType: "video",
          },
          loop: true,
          textBox: {
            textColor: "#000000",
            bgColor: "#F6F6F6",
            title: "New Feature",
            description: "Add your description here",
          },
        },
      ],
    };

    setGalleryData({
      ...galleryData,
      items: [...(galleryData?.items || []), newItem],
    });
  };

  const handleAddNewModule = (itemIndex) => {
    const newModule = {
      itemType: "videoModule",
      video: {
        entity: {
          entityId: "deec26e0-b6bc-11ef-8ba0-63340852c11c",
          entityType: "assets",
        },
        assetType: "video",
      },
      loop: true,
      textBox: {
        textColor: "#000000",
        bgColor: "#F6F6F6",
        title: "New Module",
        description: "Add your description here",
      },
    };

    const newItems = [...galleryData.items];
    newItems[itemIndex].modules.push(newModule);

    setGalleryData({
      ...galleryData,
      items: newItems,
    });
  };

  const handleExportJson = () => {
    setShowJsonOutput(true);
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

  const getModuleTitle = (module) => {
    if (module.textBox?.title) return module.textBox.title;
    if (module.options?.[0]?.textBox?.title)
      return module.options[0].textBox.title;
    if (module.modes?.[0]?.title) return module.modes[0].title;
    return "Untitled Module";
  };

  const getModuleDescription = (module) => {
    if (module.textBox?.description) return module.textBox.description;
    if (module.options?.[0]?.textBox?.description)
      return module.options[0].textBox.description;
    if (module.modes?.[0]?.description) return module.modes[0].description;
    return "No description";
  };

  const editItemName = (itemIndex, newName) => {
    const newItems = [...galleryData.items];
    newItems[itemIndex].name = newName;
    setGalleryData({
      ...galleryData,
      items: newItems,
    });
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
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your gallery block JSON here..."
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
          />
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
          <h3 className="font-semibold text-blue-900 mb-2">
            Enhanced Features:
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Drag &amp; drop modules between nav items</li>
            <li>• Edit, duplicate, and delete individual modules</li>
            <li>• Expandable module view for detailed editing</li>
            <li>• Drag &amp; drop reordering of gallery items</li>
            <li>• Edit item names, titles, and descriptions</li>
            <li>• Add new items and modules</li>
            <li>• Preview mode and JSON export</li>
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
        <div className="flex gap-2">
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
                  <div className="flex gap-2">
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
                <div className="space-y-2 ml-4">
                  {item.modules?.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="text-sm">
                      <span className="font-medium text-gray-700">
                        {moduleIndex + 1}. {getModuleTitle(module)}
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
                  <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-2">
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
                    <span className="text-sm text-gray-500 mr-2">
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
              </div>

              {expandedItems[item.id] && (
                <div className="border-t bg-gray-50 p-4">
                  <div className="space-y-3">
                    {item.modules?.map((module, moduleIndex) => (
                      <div
                        key={moduleIndex}
                        draggable
                        onDragStart={(e) =>
                          handleModuleDragStart(e, module, itemIndex, moduleIndex)
                        }
                        onDragOver={(e) =>
                          handleModuleDragOver(e, itemIndex, moduleIndex)
                        }
                        onDragLeave={handleModuleDragLeave}
                        onDrop={(e) =>
                          handleModuleDrop(e, itemIndex, moduleIndex)
                        }
                        className={`bg-white rounded-lg p-3 border cursor-move hover:shadow-sm transition-all ${
                          dragOverModule?.itemIndex === itemIndex &&
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="cursor-grab active:cursor-grabbing">
                              <Move size={14} className="text-gray-400" />
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs ${getModuleTypeColor(
                                module.itemType
                              )}`}
                            >
                              {module.itemType}
                            </span>
                            <div>
                              <div className="font-medium text-sm">
                                {getModuleTitle(module)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {getModuleDescription(module)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Edit Module - {editingModule.itemName}
              </h2>
              <button
                onClick={() => setEditingModule(null)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Module Type
                </label>
                <span
                  className={`px-3 py-1 rounded text-sm ${getModuleTypeColor(
                    editingModule.module.itemType
                  )}`}
                >
                  {editingModule.module.itemType}
                </span>
              </div>

              {editingModule.module.textBox && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingModule.module.textBox.title || ""}
                      onChange={(e) => {
                        const updatedModule = {
                          ...editingModule.module,
                          textBox: {
                            ...editingModule.module.textBox,
                            title: e.target.value,
                          },
                        };
                        setEditingModule({
                          ...editingModule,
                          module: updatedModule,
                        });
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingModule.module.textBox.description || ""}
                      onChange={(e) => {
                        const updatedModule = {
                          ...editingModule.module,
                          textBox: {
                            ...editingModule.module.textBox,
                            description: e.target.value,
                          },
                        };
                        setEditingModule({
                          ...editingModule,
                          module: updatedModule,
                        });
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingModule(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModuleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryEditor;
