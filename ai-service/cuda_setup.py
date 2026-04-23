import os
import sys

def setup_cuda():
    """
    ตั้งค่าให้ TensorFlow หา CUDA/cuDNN เจอใน Windows แบบ Native
    โดยดึง DLLs จาก NVIDIA Python Packages ใน venv
    """
    if sys.platform == 'win32':
        current_dir = os.path.dirname(os.path.abspath(__file__))
        nvidia_dir = os.path.join(current_dir, 'venv', 'Lib', 'site-packages', 'nvidia')
        
        if os.path.exists(nvidia_dir):
            for root, dirs, files in os.walk(nvidia_dir):
                if 'bin' in dirs:
                    bin_path = os.path.normpath(os.path.join(root, 'bin'))
                    try:
                        os.add_dll_directory(bin_path)
                    except Exception:
                        pass
                        
                    # 2. เพิ่มลงใน PATH เพื่อความชัวร์ (สำหรับ TensorFlow 2.10)
                    if bin_path not in os.environ['PATH']:
                        os.environ['PATH'] = bin_path + os.pathsep + os.environ['PATH']

if __name__ == "__main__":
    setup_cuda()
    import tensorflow as tf
    print("TensorFlow Version:", tf.__version__)
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print("GPU Detected:", gpus)
    else:
        print("No GPU Found")
