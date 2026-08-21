from pathlib import Path
from app.rag.document_loader import DocumentLoader
from app.rag.text_processor import TextProcessor
from docling.document_converter import DocumentConverter
path = r"D:\study-mat\project\AI_Project_Risk_Forecasting_System\uploads\athena.md"

x = DocumentLoader().load_document(path)
# doc = DocumentConverter()
y=TextProcessor.chunk_documents(x)
print(len(y))
for d in y:
    print(d)
# y = doc.convert(path).document
# print(y.export_to_markdown())


# import os 
# os.environ["TORCHINDUCTOR_DISABLE"] = "1" 
# os.environ["TORCH_COMPILE_DISABLE"] = "1" 
# from langchain_docling import DoclingLoader 
# loader = DoclingLoader(r"D:\study-mat\project\AI_Project_Risk_Forecasting_System\uploads\ascii.pdf")
# docs = loader.load() 
# print("Loaded:", len(docs)) 
# print(docs[0].page_content[:300])

