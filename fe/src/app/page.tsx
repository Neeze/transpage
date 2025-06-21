"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Tabs from '../components/Tabs';
import FeatureCard from '../components/FeatureCard';
import DemoBox from '../components/DemoBox';
import ComparisonTable from '../components/ComparisonTable';
import Testimonial from '../components/Testimonial';
import DocumentUploader from '../components/DocumentUploader';
import DocumentAnalysisDemo from '../components/DocumentAnalysisDemo';
import PricingCard from '../components/PricingCard';
import AIAssistant from '../components/AIAssistant';
import AnimatedSection from '../components/AnimatedSection';

// Icons for features
const icons = {
  document: '/images/document-icon.svg',
  ai: '/images/ai-icon.svg',
  extract: '/images/extract-icon.svg',
  custom: '/images/custom-icon.svg',
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('Easily extract text and structure');
  
  return (
    <>
      <Header />
      
      <Hero 
        title="AI-Powered Document Translation Platform"
        subtitle="Translate documents with AI-powered accuracy and speed"
      >
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium">
          Get started with Transpage
        </button>
      </Hero>
      
      {/* Overview section */}
      <AnimatedSection id="overview" className="azure-section" delay={100}>
        <div className="azure-container">
          <div className="text-center mb-16">
            <h2 className="section-heading">Instant Translation. Perfect Formatting. Effortless Workflow.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              title="Contextual Accuracy" 
              description="Precisely translates content across various specialized fields—ensuring every word conveys its intended meaning accurately."
              icon={icons.document}
              delay={100}
            />
            <FeatureCard 
              title="Preserved Layout" 
              description="Automatically maintains your original formatting—tables, images, fonts, and styles remain intact, eliminating tedious manual adjustments."
              icon={icons.ai}
              delay={200}
            />
            <FeatureCard 
              title="Rapid Results" 
              description="Translate documents swiftly without compromising accuracy ideal for deadlines in academics, business, and daily needs."
              icon={icons.extract}
              delay={300}
            />
            <FeatureCard 
              title="Post-editing & Flexible Export" 
              description="Easily review translations, make final adjustments, and export to multiple editable formats seamlessly."
              icon={icons.custom}
              delay={400}
            />
          </div>
        </div>
      </AnimatedSection>
      
      {/* Use Cases section */}
      <AnimatedSection className="azure-section bg-gray-50" delay={200}>
        <div className="azure-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Preserve Your Document’s Essence" 
              description="Quickly translate your documents with contextual accuracy, ensuring every technical term, phrase, and nuance stays true to the original meaning."
              icon={icons.document}
              delay={100}
            />
            <FeatureCard 
              title="Automatic Layout Preservation" 
              description="Keep original document formatting intact tables, headings, images, fonts exactly as intended. Translate effortlessly without tedious manual edits."
              icon={icons.ai}
              delay={200}
            />
            <FeatureCard 
              title="Seamless Export & Post-Editing" 
              description="Easily refine translations and export your completed documents directly into editable formats (Word, PDF, PPT) to fit smoothly into your workflow."
              icon={icons.extract}
              delay={300}
            />
          </div>
        </div>
      </AnimatedSection>
      
      {/* Demo section */}
      <AnimatedSection id="features" className="azure-section" delay={300}>
        <div className="azure-container">
          <div className="text-center mb-16">
            <h2 className="section-heading">Use AI to Build Document Processing Workflows</h2>
            <p className="section-subheading mx-auto">Learn how to accelerate your business processes by automating text extraction with AI Document Intelligence. This section features hands-on demos for key use cases such as document processing, knowledge mining, and industry-specific AI model customization.</p>
          </div>
          
          <div className="mb-8">
            <Tabs 
              tabs={['Easily extract text and structure', 'Customize text extraction', 'Apply AI anywhere', 'Prebuilt models']}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          
          {activeTab === 'Easily extract text and structure' && (
            <DemoBox 
              title="Easily extract text and structure with simple REST API"
              description="Process any document type with AI-powered capabilities that scale with your business. Extract text, tables, and structure with industry-leading accuracy."
              imageSrc="/images/document-demo.svg"
              imageAlt="Document processing with REST API"
            />
          )}
          
          {activeTab === 'Customize text extraction' && (
            <DemoBox 
              title="Customize text extraction to your forms"
              description="Build custom models tailored to your specific document formats and business needs. Improve accuracy with human feedback and continuous learning."
              imageSrc="/images/document-demo.svg"
              imageAlt="Custom text extraction demo"
              reverse={true}
            />
          )}
          
          {activeTab === 'Apply AI anywhere' && (
            <DemoBox 
              title="Apply AI Document Intelligence anywhere, in the cloud or at the edge"
              description="Deploy AI Document Intelligence wherever your data lives. Process documents in the cloud, on-premises, or at the edge with flexible deployment options."
              imageSrc="/images/document-demo.svg"
              imageAlt="Flexible deployment demo"
            />
          )}
          
          {activeTab === 'Prebuilt models' && (
            <DemoBox 
              title="Start with prebuilt models for common document types"
              description="Use pre-trained models for invoices, receipts, business cards, and more. Get started immediately without training custom models."
              imageSrc="/images/document-demo.svg"
              imageAlt="Prebuilt models demo"
              reverse={true}
            />
          )}
          
          {/* Try It Yourself Section */}
          {/* <div className="mt-16">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Try Document Intelligence yourself</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Upload your own document to see Transpage Document Intelligence in action.</p>
            </div> */}
            
            {/* Interactive Analysis Demo */}
            {/* <div className="mb-16">
              <DocumentAnalysisDemo />
            </div>
            
            <div className="max-w-xl mx-auto">
              <DocumentUploader />
            </div>
          </div> */}
        </div>
      </AnimatedSection>
      
      {/* Pricing section */}
      <AnimatedSection id="pricing" className="azure-section bg-gray-50" delay={400}>
        <div className="azure-container">
          <div className="text-center mb-16">
            <h2 className="section-heading">Process documents cost-effectively</h2>
            <p className="section-subheading mx-auto">Choose from free and standard pricing options to extract valuable information from documents at a fraction of the price of manual extraction.</p>
          </div>
          
          <div className="shadow-md rounded-lg overflow-hidden mb-10">
            <ComparisonTable />
          </div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <PricingCard
              title="Free"
              price="Free"
              description="Get started with basic document translation capabilities at no cost."
              features={[
                "500 document pages per month",
                "Standard models",
                "Community support"
              ]}
              ctaText="Start for free"
            />
            
            <PricingCard
              title="Premium"
              price="$20"
              description="Unlock advanced features and higher usage limits for professional needs."
              features={[
                "5,000+ document pages per month",
                "High-end models",
                "Priority access",
              ]}
              ctaText="Contact sales"
            />
          </div>
          
          <div className="flex justify-center">
            <button className="azure-button-primary">View complete pricing details</button>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Documentation and Resources section */}
      <AnimatedSection className="azure-section bg-gray-50" delay={500}>
        <div className="azure-container">
          <div className="text-center mb-16">
            <h2 className="section-heading">Documentation and resources</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              title="Get started" 
              description="Check out all the Transpage documentation."
              icon={icons.document}
              delay={100}
            />
            <FeatureCard 
              title="Receipt analysis course" 
              description="Take the receipt analysis Microsoft Learn course."
              icon={icons.ai}
              delay={200}
            />
            <FeatureCard 
              title="API Reference" 
              description="Explore the complete API documentation and code samples."
              icon={icons.extract}
              delay={300}
            />
          </div>
        </div>
      </AnimatedSection>
      
      {/* Document Upload section */}
      <AnimatedSection className="azure-section" delay={600}>
        <div className="azure-container">
          <div className="text-center mb-16">
            <h2 className="section-heading">Upload your document to see AI in action</h2>
            <p className="section-subheading mx-auto">Experience the power of Transpage by uploading a document and trying out the translation capabilities.</p>
          </div>
          
          <div className="mb-8">
            <DocumentUploader />
          </div>
        </div>
      </AnimatedSection>
      
      {/* CTA section */}
      <section className="azure-section bg-gradient-to-r from-azure-blue-800 to-azure-blue-600 text-white">
        <div className="azure-container text-center">
          <h2 className="section-heading text-white">Choose the Transpage account that's right for you</h2>
          <p className="section-subheading text-gray-100 mx-auto">Pay as you go or try Transpage free for up to 30 days.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <button className="bg-white hover:bg-gray-50 text-azure-blue-700 font-semibold py-3 px-6 rounded-md transition-all duration-300 inline-flex items-center">
              Get started with Transpage
            </button>
            <button className="bg-transparent hover:bg-azure-blue-700 text-white font-semibold py-3 px-6 rounded-md border border-white transition-all duration-300 inline-flex items-center">
              Browse documentation
            </button>
          </div>
        </div>
      </section>
      
      {/* AI Assistant */}
      <AIAssistant />
    </>
  );
}
