import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Image, Select, Input } from "@chakra-ui/react";
import * as fabric from "fabric";
import { useEffect, useRef, useState } from "react";
import { Templates } from "./template/template";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const CertificateCanvas = () => {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const deleteIconRef = useRef<HTMLDivElement | null>(null);
  const [showEditedIcon, setShowEditedIcon] = useState<boolean>(false);
  const [text, setText] = useState("Your Certificate");
  const [fontSize, setFontSize] = useState(30);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
    null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>("");
  const [templates, setTemplates] = useState(Templates);
  const [currentTemplate, setCurrentTemplate] = useState(Templates[0]);
  const [canvas, setCanvas] = useState<
    fabric.StaticCanvas<fabric.StaticCanvasEvents>
  >(
    new fabric.StaticCanvas("c", {
      height: 0,
      width: 0,
    })
  );

  useEffect(() => {
    setCanvas(
      new fabric.StaticCanvas("c", {
        height: 600,
        width: 800,
      })
    );
  }, [currentTemplate]);

  const updateCanvasDimensions = () => {
    if (canvasElementRef.current && fabricCanvasRef.current) {
      const canvasElement = canvasElementRef.current;
      const width = canvasElement.clientWidth;
      const height = canvasElement.clientHeight;

      fabricCanvasRef.current.setWidth(width);
      fabricCanvasRef.current.setHeight(height);
      fabricCanvasRef.current.renderAll();
    }
  };

  const updateDeleteIconPosition = (posX: number, posY: number) => {
    if (deleteIconRef.current) {
      deleteIconRef.current.style.top = `${posY}px`;
      deleteIconRef.current.style.left = `${posX}px`;
    }
  };

  useEffect(() => {
    var imgBgElement: HTMLImageElement = document.getElementById(
      "bg-image"
    ) as HTMLImageElement;

    if (imgBgElement) {
      imgBgElement.crossOrigin = "anonymous";
    }

    const backgroundImgObj = new fabric.Image(imgBgElement, {
      left: 0,
      top: 0,
      opacity: 1,
      scaleX: canvas.getWidth() / imgBgElement.width,
      scaleY: canvas.getHeight() / imgBgElement.height,
    });
    const objects = currentTemplate.canvasElement;

    if (canvasElementRef.current && !fabricCanvasRef.current) {
      var fabricCanvas = new fabric.Canvas(canvasElementRef.current, {
        width: 800,
        height: 600,
        backgroundImage: backgroundImgObj,
      });

      fabricCanvasRef.current = fabricCanvas;

      objects.forEach((obj) => {
        let fabricObject;
        switch (obj.type) {
          case "Text":
            fabricObject = new fabric.Text(obj.text, {
              fontSize: obj.fontSize,
              fontWeight: obj.fontWeight,
              fontFamily: obj.fontFamily,
              fontStyle: obj.fontStyle,
              lineHeight: obj.lineHeight,
              charSpacing: obj.charSpacing,
              textAlign: obj.textAlign,
              styles: obj.styles,
              pathStartOffset: obj.pathStartOffset,
              pathSide: obj.pathSide,
              pathAlign: obj.pathAlign,
              underline: obj.underline,
              overline: obj.overline,
              linethrough: obj.linethrough,
              textBackgroundColor: obj.textBackgroundColor,
              direction: obj.direction,
              left: obj.left,
              top: obj.top,
              fill: obj.fill,
              stroke: obj.stroke,
              strokeWidth: obj.strokeWidth,
              strokeDashArray: obj.strokeDashArray,
              strokeLineCap: obj.strokeLineCap,
              strokeDashOffset: obj.strokeDashOffset,
              strokeLineJoin: obj.strokeLineJoin,
              strokeUniform: obj.strokeUniform,
              strokeMiterLimit: obj.strokeMiterLimit,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              angle: obj.angle,
              flipX: obj.flipX,
              flipY: obj.flipY,
              opacity: obj.opacity,
              shadow: obj.shadow,
              visible: obj.visible,
              backgroundColor: obj.backgroundColor,
              fillRule: obj.fillRule,
              paintFirst: obj.paintFirst,
              globalCompositeOperation: obj.globalCompositeOperation,
              skewX: obj.skewX,
              skewY: obj.skewY,
            });
            break;
          default:
            console.warn(`Unsupported object type: ${obj.type}`);
        }
        if (fabricObject) {
          fabricCanvas.add(fabricObject);
        }
      });

      window.addEventListener("resize", updateCanvasDimensions);

      fabricCanvasRef.current.on("selection:created", (e) => {
        const selectedObjs = e.selected;
        setShowEditedIcon(true);

        updateDeleteIconPosition(
          selectedObjs[0].get("left"),
          selectedObjs[0].get("top") - selectedObjs[0].get("height")
        );

        if (selectedObjs && selectedObjs.length > 0) {
          setSelectedObject(selectedObjs[0]);
          setEditText(selectedObjs[0].get("text"));
        }
      });
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      window.removeEventListener("resize", updateCanvasDimensions);
    };
  }, [text, fontSize, canvas]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.on("selection:cleared", () => {
        setShowEditedIcon(false);
        if (selectedObject) {
          selectedObject.set("visible", true);
          fabricCanvasRef.current?.renderAll();
        }
        setSelectedObject(null);
        setIsEditing(false);
      });

      fabricCanvasRef.current.on("object:moving", (e) => {
        updateDeleteIconPosition(
          e.target.get("left"),
          e.target.get("top") - e.target.get("height")
        );
      });

      fabricCanvasRef.current.on("object:scaling", (e) => {
        updateDeleteIconPosition(
          e.target.get("left"),
          e.target.get("top") - e.target.get("height")
        );
      });
    }
  }, [fabricCanvasRef, selectedObject]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(e.target.value));
  };

  const addText = () => {
    if (fabricCanvasRef.current) {
      const textObj = new fabric.Text(text, {
        left: 200,
        top: 200,
        fontSize: fontSize,
      });
      fabricCanvasRef.current.add(textObj);
    }
  };

  const deleteSelectedObject = () => {
    if (fabricCanvasRef.current && selectedObject) {
      fabricCanvasRef.current.remove(selectedObject);
      setSelectedObject(null);
    }
  };

  const loadTemplate = (index: string) => {
    const objects = templates[parseInt(index)].canvasElement;
    setCurrentTemplate(templates[parseInt(index)]);

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;

      if (canvasElementRef.current && !fabricCanvasRef.current) {
        var imgBgElement: HTMLImageElement = document.getElementById(
          "bg-image"
        ) as HTMLImageElement;
        imgBgElement.crossOrigin = "anonymous";

        const backgroundImgObj = new fabric.Image(imgBgElement, {
          left: 0,
          top: 0,
          opacity: 1,
          scaleX: canvas.getWidth() / imgBgElement.width,
          scaleY: canvas.getHeight() / imgBgElement.height,
        });

        var fabricCanvas = new fabric.Canvas(canvasElementRef.current, {
          width: 800,
          height: 600,
          backgroundImage: backgroundImgObj,
        });

        fabricCanvasRef.current = fabricCanvas;

        objects.forEach((obj) => {
          let fabricObject;
          switch (obj.type) {
            case "Text":
              fabricObject = new fabric.Text(obj.text, {
                fontSize: obj.fontSize,
                fontWeight: obj.fontWeight,
                fontFamily: obj.fontFamily,
                fontStyle: obj.fontStyle,
                lineHeight: obj.lineHeight,
                charSpacing: obj.charSpacing,
                textAlign: obj.textAlign,
                styles: obj.styles,
                pathStartOffset: obj.pathStartOffset,
                pathSide: obj.pathSide,
                pathAlign: obj.pathAlign,
                underline: obj.underline,
                overline: obj.overline,
                linethrough: obj.linethrough,
                textBackgroundColor: obj.textBackgroundColor,
                direction: obj.direction,
                left: obj.left,
                top: obj.top,
                fill: obj.fill,
                stroke: obj.stroke,
                strokeWidth: obj.strokeWidth,
                strokeDashArray: obj.strokeDashArray,
                strokeLineCap: obj.strokeLineCap,
                strokeDashOffset: obj.strokeDashOffset,
                strokeLineJoin: obj.strokeLineJoin,
                strokeUniform: obj.strokeUniform,
                strokeMiterLimit: obj.strokeMiterLimit,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                angle: obj.angle,
                flipX: obj.flipX,
                flipY: obj.flipY,
                opacity: obj.opacity,
                shadow: obj.shadow,
                visible: obj.visible,
                backgroundColor: obj.backgroundColor,
                fillRule: obj.fillRule,
                paintFirst: obj.paintFirst,
                globalCompositeOperation: obj.globalCompositeOperation,
                skewX: obj.skewX,
                skewY: obj.skewY,
              });
              break;
            default:
              console.warn(`Unsupported object type: ${obj.type}`);
          }
          if (fabricObject) {
            fabricCanvas.add(fabricObject);
          }
        });

        window.addEventListener("resize", updateCanvasDimensions);
      }
    }
  };

  const handleEditButtonClick = () => {
    if (selectedObject) {
      selectedObject.set("visible", false);
      setIsEditing(true);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const handleEditTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
    selectedObject?.set("text", e.target.value);
  };

  const handleEditTextSave = () => {
    if (selectedObject && selectedObject instanceof fabric.Text) {
      selectedObject.set("text", editText);
      selectedObject.set("visible", true);
      fabricCanvasRef.current?.renderAll();
      setIsEditing(false);
    }
  };

  // const exportCanvasAsPDF = () => {
  //   if (canvasElementRef.current) {
  //     html2canvas(canvasElementRef.current).then((canvas) => {
  //       // Create a new PDF document
  //       const pdf = new jsPDF({
  //         orientation: "portrait",
  //         unit: "px",
  //         format: [canvas.width, canvas.height],
  //       });

  //       console.log(canvas);

  //       // Add the canvas image to the PDF
  //       // pdf.addImage(
  //       //   canvas.toDataURL("image/png"),
  //       //   "PNG",
  //       //   0,
  //       //   0,
  //       //   canvas.width,
  //       //   canvas.height
  //       // );

  //       // Save the PDF
  //       // pdf.save("canvas-image.pdf");
  //     });
  //   }
  // };

  const exportCanvasAsPDF = () => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const imgData = canvas.toDataURL("image/png");

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      // Save the PDF
      pdf.save("canvas-image.pdf");
    }
  };
  return (
    <Flex p="1rem" position="relative">
      <Box>
        <Image
          visibility="hidden"
          display="none"
          src={currentTemplate.backgroundImage}
          alt="background"
          id="bg-image"
        />
        <Button onClick={exportCanvasAsPDF} mt="1rem">
          Export as Image
        </Button>
        <button onClick={addText}>Add Text</button>
        {/* <Box mt="1rem">
          <Button onClick={() => saveTemplate("Template 1")}>
            Save Template 1
          </Button>
          <Button onClick={() => saveTemplate("Template 2")}>
            Save Template 2
          </Button>
        </Box> */}
        <Select
          mt="1rem"
          onChange={(e) => loadTemplate(e.target.value)}
          placeholder="Select template"
        >
          {Object.keys(templates).map((key, index) => (
            <option key={key} value={index}>
              {key}
            </option>
          ))}
        </Select>
      </Box>
      <Box
        borderWidth="2px"
        width="fit-content"
        height="fit-content"
        position="relative"
      >
        <canvas ref={canvasElementRef} autoFocus />
        <Flex
          ref={deleteIconRef}
          position="absolute"
          zIndex={99999}
          visibility={showEditedIcon ? "visible" : "hidden"}
        >
          <Box
            onClick={deleteSelectedObject}
            cursor="pointer"
            backgroundColor="red"
            color="white"
            padding="4px"
            borderRadius="50%"
          >
            <DeleteIcon />
          </Box>

          <Box
            onClick={handleEditButtonClick}
            cursor="pointer"
            backgroundColor="blue"
            color="white"
            padding="4px"
            borderRadius="50%"
          >
            <EditIcon />
          </Box>
        </Flex>
        {isEditing && selectedObject && (
          <Input
            position="absolute"
            top={selectedObject.get("top")}
            left={selectedObject.get("left")}
            width={selectedObject.get("width")}
            value={editText}
            onChange={handleEditTextChange}
            onBlur={handleEditTextSave}
            autoFocus
          />
        )}
      </Box>
    </Flex>
  );
};

export default CertificateCanvas;
