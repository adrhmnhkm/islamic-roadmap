import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import ResourceRating from './ResourceRating';

interface SubResource {
  title: string;
  type: 'video' | 'article' | 'book';
  description: string;
  url: string;
}

interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'book';
  description: string;
  subResources?: SubResource[];
}

interface NodeData {
  id: string;
  label: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  completed?: boolean;
  resources: Resource[];
}

interface EdgeData {
  source: string;
  target: string;
}

interface LearningRoadmapProps {
  nodes: NodeData[];
  edges: EdgeData[];
}

const ResourceTypeIcon = ({ type }: { type: Resource['type'] }) => {
  switch (type) {
    case 'video':
      return '🎥';
    case 'article':
      return '📄';
    case 'book':
      return '📚';
  }
};

const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ nodes }) => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const basicNodes = nodes.filter(node => node.level === 'basic');
  const intermediateNodes = nodes.filter(node => node.level === 'intermediate');
  const advancedNodes = nodes.filter(node => node.level === 'advanced');

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-8">
        {/* Basic Level */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
              Dasar
            </span>
          </div>
          {basicNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="relative bg-white p-4 rounded-lg cursor-pointer transition-all duration-300
                border border-emerald-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-gray-800">{node.label}</h3>
                <p className="text-xs text-gray-500">{node.description}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <span>{node.resources.length} sumber</span>
                </div>
                {node.completed && (
                  <span className="absolute top-2 right-2 text-emerald-500">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Intermediate Level */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              Menengah
            </span>
          </div>
          {intermediateNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="relative bg-white p-4 rounded-lg cursor-pointer transition-all duration-300
                border border-blue-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-gray-800">{node.label}</h3>
                <p className="text-xs text-gray-500">{node.description}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <span>{node.resources.length} sumber</span>
                </div>
                {node.completed && (
                  <span className="absolute top-2 right-2 text-emerald-500">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Level */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
              Lanjutan
            </span>
          </div>
          {advancedNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="relative bg-white p-4 rounded-lg cursor-pointer transition-all duration-300
                border border-purple-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-gray-800">{node.label}</h3>
                <p className="text-xs text-gray-500">{node.description}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <span>{node.resources.length} sumber</span>
                </div>
                {node.completed && (
                  <span className="absolute top-2 right-2 text-emerald-500">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Dialog */}
      <Dialog.Root open={!!selectedNode} onOpenChange={() => {
        setSelectedNode(null);
        setSelectedResource(null);
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Dialog.Title className="text-lg font-medium text-gray-800">
                  {selectedNode?.label}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-1">
                  {selectedNode?.description}
                </Dialog.Description>
              </div>
              <Dialog.Close className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              {selectedNode?.resources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedResource(selectedResource?.title === resource.title ? null : resource)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{ResourceTypeIcon({ type: resource.type })}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800">{resource.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Buka
                          <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </div>
                      {resource.subResources && (
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => setSelectedResource(selectedResource?.title === resource.title ? null : resource)}
                        >
                          <svg 
                            className={`w-5 h-5 transform transition-transform ${selectedResource?.title === resource.title ? 'rotate-180' : ''}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <ResourceRating
                      resourceId={`${selectedNode.id}-${resource.title}`}
                      resourceTitle={resource.title}
                    />

                    {/* Sub-resources */}
                    <AnimatePresence>
                      {selectedResource?.title === resource.title && resource.subResources && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pl-8 space-y-3"
                        >
                          {resource.subResources.map((subResource, subIndex) => (
                            <motion.div
                              key={subIndex}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIndex * 0.1 }}
                              className="p-2 bg-white rounded-lg border border-gray-100"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-base">{ResourceTypeIcon({ type: subResource.type })}</span>
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-gray-700">{subResource.title}</h5>
                                  <p className="text-xs text-gray-500 mt-1">{subResource.description}</p>
                                  <a
                                    href={subResource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700 mt-2"
                                  >
                                    Buka
                                    <svg className="w-3 h-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default LearningRoadmap;