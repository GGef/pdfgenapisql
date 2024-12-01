import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSpreadsheet, ArrowRight, FileText, Database, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const features = [
    {
      icon: FileText,
      title: "Smart Templates",
      description: "Create dynamic PDF templates with our intuitive editor"
    },
    {
      icon: Database,
      title: "Data Import",
      description: "Import CSV data and map it to your templates effortlessly"
    },
    {
      icon: Zap,
      title: "Batch Processing",
      description: "Generate multiple PDFs in seconds with batch processing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <nav className="absolute top-0 left-0 right-0 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <FileSpreadsheet className="w-8 h-8" />
            <span className="text-xl font-bold">PDF Generator</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 rounded-full bg-white text-blue-900 font-medium hover:bg-opacity-90 transition-colors"
          >
            Login
          </button>
        </div>
      </nav>

      <motion.div
        className="max-w-7xl mx-auto px-6 pt-32 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Transform Your Data Into Professional PDFs
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Generate beautiful PDF documents from your CSV data with our powerful template engine
            </p>
            <motion.button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-8 py-3 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </motion.div>

          <motion.div
            className="relative"
            animate={floatingAnimation}
          >
            <div className="relative z-10">
              <motion.div
                className="absolute -top-16 -left-16 w-32 h-32 bg-blue-500 rounded-2xl opacity-20"
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                  transition: { duration: 8, repeat: Infinity }
                }}
              />
              <motion.div
                className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-500 rounded-full opacity-20"
                animate={{
                  rotate: -360,
                  scale: [1, 1.2, 1],
                  transition: { duration: 8, repeat: Infinity }
                }}
              />
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  <div className="h-4 bg-white/20 rounded w-5/6"></div>
                  <div className="h-32 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
              whileHover={{ y: -5 }}
            >
              <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-blue-100">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}